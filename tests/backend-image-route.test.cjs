/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const createLoader = require("./helpers/load-ts.cjs");

function handler({ session = { backendAccessToken: "Bearer test-token" }, fetchImpl = async () => { throw new Error("Unexpected upstream request"); } } = {}) {
  assert.ok(fs.existsSync("src/app/api/backend-images/route.ts"), "uploaded images need a same-origin GET handler");
  return createLoader({ env: { API_URL: "http://localhost:8081/api/v1" }, mocks: { "@/auth": { auth: async () => session } }, fetchImpl })("src/app/api/backend-images/route.ts").GET;
}
const request = (path) => new Request(`http://localhost/api/backend-images?${new URLSearchParams({ path })}`);

test("backend image proxy requires a session", async () => {
  assert.equal((await handler({ session: null })(request("/uploads/profiles/me.png"))).status, 401);
});

test("backend image proxy streams image bytes with the caller's token", async () => {
  let upstream;
  const get = handler({ fetchImpl: async (url, options) => {
    upstream = { url, options };
    return new Response(new Uint8Array([137, 80, 78, 71]), { headers: { "Content-Type": "image/png" } });
  } });
  const response = await get(request("/api/v1/uploads/profiles/my%20photo.png"));
  assert.equal(upstream.url, "http://localhost:8081/api/v1/uploads/profiles/my%20photo.png");
  assert.equal(upstream.options.headers.Authorization, "Bearer test-token");
  assert.equal(upstream.options.redirect, "error");
  assert.equal(response.headers.get("Content-Type"), "image/png");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [137, 80, 78, 71]);
});

test("backend image proxy rejects arbitrary destinations and path traversal", async () => {
  const get = handler();
  for (const path of ["https://other.example/a.png", "//other.example/a.png", "/auth/me", "/uploads/../auth/me", "/uploads/%2e%2e/auth/me", "/uploads/profiles/a%2Fb.png", "/uploads/profiles/a%252fb.png", "/uploads/profiles/..\\auth\\me"]) {
    assert.equal((await get(request(path))).status, 400, path);
  }
});

test("backend image proxy reports missing files and rejects non-images", async () => {
  const missing = await handler({ fetchImpl: async () => new Response(null, { status: 404 }) })(request("/uploads/profiles/missing.png"));
  assert.equal(missing.status, 404);
  for (const contentType of ["text/html", "application/json", "image/svg+xml"]) {
    const response = await handler({ fetchImpl: async () => new Response("not a photo", { headers: { "Content-Type": contentType } }) })(request("/uploads/profiles/me.png"));
    assert.equal(response.status, 502, contentType);
  }
});

test("backend image proxy returns a gateway error for connection failures or redirects", async () => {
  const response = await handler({ fetchImpl: async () => { throw new Error("fetch failed"); } })(request("/uploads/profiles/me.png"));
  assert.equal(response.status, 502);
});
