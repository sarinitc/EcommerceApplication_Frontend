/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const routePath = path.join(__dirname, "..", "src", "app", "api", "products", "[productId]", "route.ts");

function loadRoute({
  session = { backendAccessToken: "Bearer test-token" },
  apiUrl = "http://localhost:8081/api/v1/",
  fetchImpl = async () => { throw new Error("Unexpected upstream request"); },
} = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(routePath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (specifier) => specifier === "@/auth" ? { auth: async () => session } : require(specifier);
  new Function("exports", "require", "module", "fetch", "process", "Request", "Response", compiled)(
    loadedModule.exports, localRequire, loadedModule, fetchImpl,
    { env: { API_URL: apiUrl } }, Request, Response,
  );
  assert.equal(typeof loadedModule.exports.DELETE, "function", "products must expose a DELETE handler");
  return loadedModule.exports.DELETE;
}

function remove(handler, productId = "42") {
  return handler(new Request(`http://localhost/api/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  }), { params: Promise.resolve({ productId }) });
}

function envelope(success, message, status = 200) {
  return { success, message, status, payload: null, timestamp: "2026-09-15T00:00:00Z" };
}

test("rejects deletion without a signed-in backend token", async () => {
  let calls = 0;
  const response = await remove(loadRoute({ session: null, fetchImpl: async () => { calls++; } }));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).success, false);
  assert.equal(calls, 0);
});

test("reports missing backend configuration before making a delete request", async () => {
  const response = await remove(loadRoute({ apiUrl: null }));
  assert.equal(response.status, 500);
});

test("rejects invalid product IDs without contacting the backend", async () => {
  let calls = 0;
  const handler = loadRoute({ fetchImpl: async () => { calls++; } });
  for (const productId of ["0", "-1", "abc", "1/2", "1.5"]) {
    const response = await remove(handler, productId);
    assert.equal(response.status, 400, productId);
  }
  assert.equal(calls, 0);
});

test("deletes the requested product using the documented backend path and caller token", async () => {
  let upstream;
  const handler = loadRoute({ fetchImpl: async (url, options) => {
    upstream = { url, options };
    return Response.json(envelope(true, "Product deleted successfully."));
  } });
  const response = await remove(handler);
  assert.equal(upstream.url, "http://localhost:8081/api/v1/products/42");
  assert.equal(upstream.options.method, "DELETE");
  assert.equal(upstream.options.headers.Authorization, "Bearer test-token");
  assert.equal(upstream.options.body, undefined);
  assert.equal(upstream.options.cache, "no-store");
  assert.equal(upstream.options.redirect, "error");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, message: "Product deleted successfully." });
});

test("accepts a successful no-content deletion without trying to return JSON at status 204", async () => {
  const response = await remove(loadRoute({ fetchImpl: async () => new Response(null, { status: 204 }) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test("preserves backend deletion failures so the UI keeps the product", async (t) => {
  for (const status of [401, 403, 404, 409, 500]) {
    await t.test(String(status), async () => {
      const response = await remove(loadRoute({ fetchImpl: async () => Response.json(
        envelope(false, "Product could not be deleted.", status), { status },
      ) }));
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { success: false, message: "Product could not be deleted." });
    });
  }
});

test("does not report success for an HTTP 200 backend failure envelope", async () => {
  for (const [backendStatus, expectedStatus] of [[200, 400], [409, 409]]) {
    const response = await remove(loadRoute({ fetchImpl: async () => Response.json(
      envelope(false, "Product is linked to an order.", backendStatus),
    ) }));
    assert.equal(response.status, expectedStatus);
    assert.deepEqual(await response.json(), { success: false, message: "Product is linked to an order." });
  }
});

test("does not remove a product on malformed successful backend responses", async () => {
  for (const body of ["not-json", "null", "{}", '{"success":"true"}']) {
    const response = await remove(loadRoute({ fetchImpl: async () => new Response(body, { status: 200 }) }));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
  }
});

test("returns a readable error if an upstream error body is not JSON", async () => {
  const response = await remove(loadRoute({ fetchImpl: async () => new Response("Unavailable", { status: 503 }) }));
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.match(body.message, /503/);
});

test("returns a gateway error when the backend cannot be reached", async () => {
  const response = await remove(loadRoute({ fetchImpl: async () => { throw new Error("connection refused"); } }));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, false);
});
