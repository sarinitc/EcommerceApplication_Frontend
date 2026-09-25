/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const file = path.join(__dirname, "..", "src", "components", "features", "admin", "customers", "save-customer.ts");
function load() {
  const mod = { exports: {} };
  if (fs.existsSync(file)) {
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("module", "exports", "fetch", code)(mod, mod.exports, fetch);
  }
  assert.equal(typeof mod.exports.saveCustomer, "function");
  return mod.exports;
}
const data = { createPayload: { username: "Ada", profileImage: null }, editPayload: { firstName: "Ada", profileImage: "/existing.jpg" } };

test("create sends JSON without a blob URL, then uploads the selected file under the returned customer ID", async () => {
  const calls = [];
  const selected = new Blob(["image"], { type: "image/png" });
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1 ? Response.json({ success: true, payload: { customerId: 42 } }) : Response.json({ success: true, payload: { profileImage: "/42.png" } });
  };
  const result = await load().saveCustomer({ mode: "create", ...data, imageFile: selected, fetchImpl });
  assert.equal(result.customerId, 42);
  assert.equal(calls[0].url, "/api/admin/customers");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(JSON.parse(calls[0].options.body).profileImage, null);
  assert.equal(calls[1].url, "/api/admin/customers/42/image");
  assert.equal(calls[1].options.method, "POST");
  assert.equal(calls[1].options.body.get("file").type, selected.type);
  assert.deepEqual(Buffer.from(await calls[1].options.body.get("file").arrayBuffer()), Buffer.from(await selected.arrayBuffer()));
  assert.equal(calls[1].options.headers, undefined);
});

test("a failed create image upload carries the created ID so retry cannot create a duplicate", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/image") && calls.length === 2) return Response.json({ message: "Image rejected" }, { status: 422 });
    return url === "/api/admin/customers" ? Response.json({ success: true, payload: { customerId: 57 } }) : Response.json({ success: true });
  };
  const saveCustomer = load().saveCustomer;
  let failure;
  try { await saveCustomer({ mode: "create", ...data, imageFile: new Blob(["x"], { type: "image/png" }), fetchImpl }); }
  catch (error) { failure = error; }
  assert.equal(failure.customerId, 57);
  assert.match(failure.message, /Image rejected/);
  await saveCustomer({ mode: "create", customerId: failure.customerId, ...data, imageFile: new Blob(["x"], { type: "image/png" }), fetchImpl });
  assert.deepEqual(calls.map(c => c.options.method), ["POST", "POST", "PATCH", "POST"]);
  assert.equal(calls.filter(c => c.url === "/api/admin/customers").length, 1);
});

test("edit preserves the saved image value and uploads a selected file separately", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => { calls.push({ url, options }); return Response.json({ success: true }); };
  await load().saveCustomer({ mode: "edit", customerId: 9, ...data, imageFile: new Blob(["x"], { type: "image/webp" }), fetchImpl });
  assert.equal(calls[0].url, "/api/admin/customers/9");
  assert.equal(JSON.parse(calls[0].options.body).profileImage, "/existing.jpg");
  assert.equal(calls[1].url, "/api/admin/customers/9/image");
});

test("edit clears an old persisted blob URL from JSON before uploading its replacement", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => { calls.push({ url, options }); return Response.json({ success: true, payload: { profileImage: "/9.png" } }); };
  await load().saveCustomer({ mode: "edit", customerId: 9, createPayload: data.createPayload, editPayload: { ...data.editPayload, profileImage: "  blob:http://localhost/old" }, imageFile: new Blob(["x"], { type: "image/png" }), fetchImpl });
  assert.equal(JSON.parse(calls[0].options.body).profileImage, null);
  assert.equal(calls[1].url, "/api/admin/customers/9/image");
});

test("successful create without an ID is marked as created so the form can block duplicate retry", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return Response.json({ success: true }, { status: 201 }); };
  await assert.rejects(
    load().saveCustomer({ mode: "create", ...data, imageFile: new Blob(["x"], { type: "image/png" }), fetchImpl }),
    error => error.stage === "unknown-id" && /created.*ID was missing/i.test(error.message),
  );
  assert.equal(calls, 1);
});
