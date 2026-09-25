/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const routePath = path.join(__dirname, "..", "src", "app", "api", "admin", "customers", "[customerId]", "image", "route.ts");
function load({ session = { user: { roles: ["ADMIN"] }, backendAccessToken: "Bearer token" }, fetchImpl = async () => Response.json({ success: true }), env = { API_URL: "http://localhost:8081/api/v1/" } } = {}) {
  const mod = { exports: {} };
  if (fs.existsSync(routePath)) {
    const code = ts.transpileModule(fs.readFileSync(routePath, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("module", "exports", "require", "fetch", "process", "Response", "FormData", "Blob", code)(mod, mod.exports, name => name === "@/auth" ? { auth: async () => session } : require(name), fetchImpl, { env }, Response, FormData, Blob);
  }
  assert.equal(typeof mod.exports.POST, "function");
  return mod.exports.POST;
}
function request(file = new Blob(["image"], { type: "image/png" })) {
  const form = new FormData();
  if (file) form.append("file", file, "customer.png");
  return new Request("http://localhost/api/admin/customers/42/image", { method: "POST", body: form });
}
const params = { params: Promise.resolve({ customerId: "42" }) };
test("image proxy requires admin credentials and a numeric customer ID", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return Response.json({ success: true }); };
  assert.equal((await load({ session: null, fetchImpl })(request(), params)).status, 403);
  assert.equal((await load({ session: { user: { roles: ["ADMIN"] } }, fetchImpl })(request(), params)).status, 401);
  assert.equal((await load({ fetchImpl })(request(), { params: Promise.resolve({ customerId: "../1" }) })).status, 400);
  assert.equal(calls, 0);
});
test("image proxy validates file presence, type, and 5 MB limit", async () => {
  let calls = 0;
  const post = load({ fetchImpl: async () => { calls++; return Response.json({ success: true }); } });
  assert.equal((await post(request(null), params)).status, 400);
  assert.equal((await post(request(new Blob(["x"], { type: "image/gif" })), params)).status, 400);
  assert.equal((await post(request(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" })), params)).status, 413);
  assert.equal(calls, 0);
});
test("image proxy forwards multipart file and token without following redirects", async () => {
  let upstream;
  const post = load({ fetchImpl: async (url, options) => { upstream = { url, options }; return Response.json({ success: true, payload: { fileName: "a.png", profileImage: "/a.png" } }); } });
  const response = await post(request(), params);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).payload.profileImage, "/a.png");
  assert.equal(upstream.url, "http://localhost:8081/api/v1/admin/customers/42/image");
  assert.equal(upstream.options.method, "POST");
  assert.equal(upstream.options.headers.Authorization, "Bearer token");
  assert.equal(upstream.options.redirect, "error");
  assert.equal(upstream.options.body.get("file").type, "image/png");
});
test("image proxy preserves an upstream validation error", async () => {
  const post = load({ fetchImpl: async () => Response.json({ success: false, message: "Image rejected" }, { status: 422 }) });
  const response = await post(request(), params);
  assert.equal(response.status, 422);
  assert.equal((await response.json()).message, "Image rejected");
});
test("image proxy rejects empty and false-success backend responses", async () => {
  for (const fetchImpl of [
    async () => new Response(null, { status: 204 }),
    async () => Response.json({ success: true }),
    async () => Response.json({ success: false, message: "Upload denied", status: 400 }),
  ]) {
    const response = await load({ fetchImpl })(request(), params);
    assert.ok(response.status >= 400);
  }
});
