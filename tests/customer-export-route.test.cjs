/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const routePath = path.join(__dirname, "..", "src", "app", "api", "admin", "customers", "export", "route.ts");
function loadRoute({
  session = { user: { roles: ["ADMIN"] }, backendAccessToken: "Bearer export-token" },
  env = { API_URL: "http://localhost:8081/api/v1/" },
  fetchImpl = async () => { throw new Error("Unexpected upstream request"); },
} = {}) {
  const loadedModule = { exports: {} };
  if (fs.existsSync(routePath)) {
    const compiled = ts.transpileModule(fs.readFileSync(routePath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = (specifier) => specifier === "@/auth" ? { auth: async () => session } : require(specifier);
    new Function("exports", "require", "module", "fetch", "process", "Request", "Response", "Headers", compiled)(
      loadedModule.exports, localRequire, loadedModule, fetchImpl, { env }, Request, Response, Headers,
    );
  }
  assert.equal(typeof loadedModule.exports.GET, "function", "customer export must expose a GET handler");
  return loadedModule.exports.GET;
}

function request(query = "") {
  return new Request(`http://localhost/api/admin/customers/export${query ? `?${query}` : ""}`);
}

function csvResponse() {
  return new Response("customerId,username\r\n42,Customer\r\n", { headers: { "Content-Type": "text/csv" } });
}

test("rejects export without a backend session token", async () => {
  for (const session of [null, { user: { roles: ["ADMIN"] } }]) {
    let calls = 0;
    const response = await loadRoute({ session, fetchImpl: async () => { calls++; } })(request());
    assert.equal(response.status, 401);
    assert.match((await response.json()).message, /sign in/i);
    assert.equal(calls, 0);
  }
});

test("rejects non-admin customer export before contacting the backend", async () => {
  let calls = 0;
  const response = await loadRoute({
    session: { user: { roles: ["CUSTOMER"] }, backendAccessToken: "token" },
    fetchImpl: async () => { calls++; },
  })(request());
  assert.equal(response.status, 403);
  assert.equal(calls, 0);
});

test("reports missing backend configuration", async () => {
  const response = await loadRoute({ env: {} })(request());
  assert.equal(response.status, 500);
  assert.match((await response.json()).message, /not configured/i);
});

test("requests the documented CSV endpoint with the caller bearer token", async () => {
  let upstream;
  const response = await loadRoute({ fetchImpl: async (url, options) => {
    upstream = { url, options };
    return csvResponse();
  } })(request());
  assert.equal(response.status, 200);
  assert.equal(upstream.url, "http://localhost:8081/api/v1/admin/customers/export");
  assert.equal(upstream.options.method, "GET");
  assert.equal(upstream.options.headers.Authorization, "Bearer export-token");
  assert.equal(upstream.options.headers.Accept, "text/csv");
  assert.equal(upstream.options.cache, "no-store");
  assert.equal(upstream.options.redirect, "error");
});

test("uses NEXT_PUBLIC_API_URL when API_URL is unavailable", async () => {
  let url;
  const response = await loadRoute({
    env: { NEXT_PUBLIC_API_URL: "http://localhost:8081/api/v1/" },
    fetchImpl: async (value) => { url = value; return csvResponse(); },
  })(request());
  assert.equal(response.status, 200);
  assert.equal(url, "http://localhost:8081/api/v1/admin/customers/export");
});

test("forwards trimmed search and normalized status without pagination or unsupported filters", async () => {
  let url;
  await loadRoute({ fetchImpl: async (value) => { url = value; return csvResponse(); } })(
    request("search=%20Ada%20%26%20Co%20&status=active&page=3&size=20&location=London&customerIds=42"),
  );
  assert.equal(url, "http://localhost:8081/api/v1/admin/customers/export?search=Ada+%26+Co&status=ACTIVE");
});

test("omits blank search and all-status filters", async () => {
  for (const query of ["search=%20%20&status=all", "search=&status=%20", "status=ALL"]) {
    let url;
    await loadRoute({ fetchImpl: async (value) => { url = value; return csvResponse(); } })(request(query));
    assert.equal(url, "http://localhost:8081/api/v1/admin/customers/export");
  }
});

test("supports each documented account status", async () => {
  for (const status of ["INVITED", "ACTIVE", "BLOCKED"]) {
    let url;
    const response = await loadRoute({ fetchImpl: async (value) => { url = value; return csvResponse(); } })(request(`status=${status}`));
    assert.equal(response.status, 200);
    assert.equal(url, `http://localhost:8081/api/v1/admin/customers/export?status=${status}`);
  }
});
test("rejects unsupported account statuses instead of silently exporting every customer", async () => {
  let calls = 0;
  const handler = loadRoute({ fetchImpl: async () => { calls++; } });
  for (const status of ["Inactive", "DELETED"]) {
    const response = await handler(request(`status=${status}`));
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /INVITED.*ACTIVE.*BLOCKED/);
  }
  assert.equal(calls, 0);
});

test("preserves CSV bytes, filename, and content type without allowing caching", async () => {
  const bytes = Buffer.from("\ufeffcustomerId,username\r\n42,\"Sok, សុខ\"\r\n", "utf8");
  const response = await loadRoute({ fetchImpl: async () => new Response(bytes, { headers: {
    "Content-Type": "text/csv; charset=UTF-8",
    "Content-Disposition": "attachment; filename=customers-2026.csv; filename*=UTF-8''customers-%E1%9E%9F.csv",
    "Cache-Control": "public, max-age=3600",
  } }) })(request());
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.equal(response.headers.get("Content-Type"), "text/csv; charset=UTF-8");
  assert.equal(response.headers.get("Content-Disposition"), "attachment; filename=customers-2026.csv; filename*=UTF-8''customers-%E1%9E%9F.csv");
  assert.match(response.headers.get("Cache-Control"), /private/);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
});

test("provides CSV download headers when the backend omits them", async () => {
  const response = await loadRoute({ fetchImpl: async () => new Response(new Uint8Array([65, 44, 66, 10])) })(request());
  assert.equal(response.headers.get("Content-Type"), "text/csv; charset=utf-8");
  assert.equal(response.headers.get("Content-Disposition"), 'attachment; filename="customers.csv"');
});

test("preserves upstream HTTP failures and backend messages as JSON", async () => {
  for (const status of [400, 401, 403, 500, 503]) {
    const response = await loadRoute({ fetchImpl: async () => Response.json({
      success: false, message: "Export could not be completed.", status, payload: null,
    }, { status }) })(request());
    assert.equal(response.status, status);
    assert.equal((await response.json()).message, "Export could not be completed.");
    assert.equal(response.headers.get("Content-Disposition"), null);
  }
});

test("provides a readable error when an upstream failure body is not JSON", async () => {
  const response = await loadRoute({ fetchImpl: async () => new Response("Unavailable", { status: 503 }) })(request());
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /503/);
});

test("never downloads a JSON error envelope returned with HTTP 200", async () => {
  const response = await loadRoute({ fetchImpl: async () => Response.json({
    success: false, message: "Customer export is unavailable.", status: 403, payload: null,
  }) })(request());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).message, "Customer export is unavailable.");
  assert.equal(response.headers.get("Content-Disposition"), null);
});
test("rejects successful JSON and empty responses because they contain no CSV download", async () => {
  for (const fetchImpl of [
    async () => Response.json({ success: true, payload: [] }),
    async () => new Response("{", { headers: { "Content-Type": "application/problem+json" } }),
    async () => new Response(null, { status: 204 }),
  ]) {
    const response = await loadRoute({ fetchImpl })(request());
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("Content-Disposition"), null);
  }
});
test("returns a gateway error when the backend cannot be reached", async () => {
  const response = await loadRoute({ fetchImpl: async () => { throw new Error("connection refused"); } })(request());
  assert.equal(response.status, 502);
  assert.match((await response.json()).message, /try again/i);
});