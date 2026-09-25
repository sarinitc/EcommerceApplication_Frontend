/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const createLoader = require("./helpers/load-ts.cjs");

const apiUrl = "http://localhost:8081/api/v1";
const session = { backendAccessToken: "Bearer test-token", backendUserId: 7, user: { roles: ["ADMIN"] } };

for (const route of ["products", "products/[productId]", "products/new-arrivals", "admin/dashboard/overview"]) {
  test(`${route} returns usable encoded image URLs`, async () => {
    const products = [
      { productId: 1, image: `${apiUrl}/uploads/products/my%20photo.png` },
      { productId: 2, image: "/api/product-images/existing.png" },
    ];
    const expected = ["/api/product-images/my%20photo.png", "/api/product-images/existing.png"];
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const payload = route.includes("overview") ? { topProducts: [product] }
        : route.includes("[productId]") ? product : { content: [product] };
      const load = createLoader({ env: { API_URL: apiUrl }, mocks: { "@/auth": { auth: async () => session } },
        fetchImpl: async () => Response.json({ success: true, payload }) });
      const response = await load(`src/app/api/${route}/route.ts`).GET(new Request("http://localhost/api/products"), { params: Promise.resolve({ productId: "1" }) });
      const body = await response.json();
      const image = body.payload.image ?? body.payload.content?.[0]?.image ?? body.payload.topProducts?.[0]?.image;
      assert.equal(image, expected[index]);
    }
  });
}

test("product edit restores a proxied filename without double encoding", async () => {
  let submitted;
  const load = createLoader({ env: { API_URL: apiUrl }, mocks: { "@/auth": { auth: async () => session } },
    fetchImpl: async (_url, options) => { submitted = JSON.parse(options.body); return Response.json({ success: true }); } });
  await load("src/app/api/products/[productId]/route.ts").PUT(new Request("http://localhost/api/products/1", {
    method: "PUT", body: JSON.stringify({ image: "/api/product-images/my%20photo.png" }),
  }), { params: Promise.resolve({ productId: "1" }) });
  assert.equal(submitted.image, `${apiUrl}/uploads/products/my%20photo.png`);
});

test("existing sessions resolve relative profile images through the app", () => {
  // Capture the real callbacks without starting NextAuth's HTTP handlers.
  let callbacks;
  const capture = createLoader({ env: { API_URL: apiUrl }, mocks: {
    "next-auth": (config) => { callbacks = config.callbacks; return {}; },
    "next-auth/providers/credentials": (config) => config,
  } });
  capture("src/auth.ts");
  const result = callbacks.session({ session: { user: {} }, token: { picture: "/uploads/profiles/me.png" } });
  assert.equal(result.user.image, "/api/backend-images?path=%2Fuploads%2Fprofiles%2Fme.png");
});

test("image helpers preserve external URLs and encode each filename once", () => {
  const { resolveProductImageUrl, resolveProfileImageUrl } = createLoader()("src/lib/image-urls.ts");
  for (const [input, expected] of [
    ["plain.png", "/api/product-images/plain.png"],
    [`${apiUrl}/uploads/products/100%25.png`, "/api/product-images/100%25.png"],
    ["https://cdn.example/uploads/products/a%20b.png", "https://cdn.example/uploads/products/a%20b.png"],
    ["//cdn.example/photo.png", "//cdn.example/photo.png"],
    ["data:image/png;base64,abc", "data:image/png;base64,abc"],
    ["", ""],
  ]) assert.equal(resolveProductImageUrl(input, apiUrl), expected);
  assert.equal(resolveProfileImageUrl(`${apiUrl}/uploads/profiles/my%20photo.png`, apiUrl), "/api/backend-images?path=%2Fapi%2Fv1%2Fuploads%2Fprofiles%2Fmy%2520photo.png");
  assert.equal(resolveProfileImageUrl("https://cdn.example/photo.png", apiUrl), "https://cdn.example/photo.png");
  assert.equal(resolveProfileImageUrl("/uploads/profiles/me.png", ""), "/api/backend-images?path=%2Fuploads%2Fprofiles%2Fme.png");
  assert.equal(resolveProfileImageUrl("/api/v1/uploads/profiles/me.png", ""), "/api/backend-images?path=%2Fapi%2Fv1%2Fuploads%2Fprofiles%2Fme.png");
  assert.equal(resolveProfileImageUrl("/api/backend-images?path=%2Fuploads%2Fprofiles%2Fme.png", apiUrl), "/api/backend-images?path=%2Fuploads%2Fprofiles%2Fme.png");
});

test("profile uploads return a usable image URL", async () => {
  const load = createLoader({ env: { API_URL: apiUrl }, mocks: { "@/auth": { auth: async () => session } },
    fetchImpl: async () => Response.json({ success: true, payload: { fileName: "me.png", profileImage: "/uploads/profiles/me.png" } }) });
  const body = new FormData();
  body.set("file", new File(["image"], "me.png", { type: "image/png" }));
  const response = await load("src/app/api/profile/avatar/route.ts").POST(new Request("http://localhost/api/profile/avatar", { method: "POST", body }));
  assert.equal((await response.json()).payload.profileImage, "/api/backend-images?path=%2Fuploads%2Fprofiles%2Fme.png");
});
