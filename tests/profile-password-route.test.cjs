/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const routePath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "api",
  "profile",
  "password",
  "route.ts",
);

function loadRoute({ session = null, fetchImpl = async () => {
  throw new Error("Unexpected upstream request");
} } = {}) {
  if (!fs.existsSync(routePath)) return {};

  const source = fs.readFileSync(routePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const localProcess = { env: { ...process.env, API_URL: "https://backend.example/api/v1" } };
  const localRequire = (specifier) => {
    if (specifier === "@/auth") return { auth: async () => session };
    return require(specifier);
  };
  const execute = new Function(
    "exports",
    "require",
    "module",
    "fetch",
    "process",
    "Request",
    "Response",
    "Headers",
    compiled,
  );
  execute(
    loadedModule.exports,
    localRequire,
    loadedModule,
    fetchImpl,
    localProcess,
    Request,
    Response,
    Headers,
  );
  return loadedModule.exports;
}

function request(body, headers = {}) {
  return new Request("http://localhost/api/profile/password", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function authenticatedSession(token = "Bearer secret-token") {
  return { user: { name: "Member" }, backendAccessToken: token };
}

function envelope({ success, message, status }) {
  return {
    success,
    message,
    status,
    payload: null,
    timestamp: "2026-09-14T00:00:00Z",
  };
}

async function json(response) {
  return { status: response.status, body: await response.json() };
}

test("rejects unauthenticated password changes before calling the backend", async () => {
  let calls = 0;
  const { POST } = loadRoute({ fetchImpl: async () => { calls += 1; } });

  assert.equal(typeof POST, "function", "password route handler should exist");
  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { success: false, message: "Please sign in to change your password." });
  assert.equal(calls, 0);
});

test("rejects malformed JSON and non-string password fields", async (t) => {
  const { POST } = loadRoute({ session: authenticatedSession() });

  await t.test("malformed JSON", async () => {
    const result = await json(await POST(request("{")));
    assert.equal(result.status, 400);
    assert.equal(result.body.success, false);
  });

  await t.test("non-string field", async () => {
    const result = await json(await POST(request({
      currentPassword: "old-password",
      newPassword: 12345678,
      confirmPassword: "12345678",
    })));
    assert.equal(result.status, 400);
    assert.equal(result.body.success, false);
  });

  await t.test("unexpected field", async () => {
    const result = await json(await POST(request({
      currentPassword: "old-password",
      newPassword: "new-password-8",
      confirmPassword: "new-password-8",
      email: "victim@example.com",
    })));
    assert.equal(result.status, 400);
    assert.equal(result.body.success, false);
  });

  await t.test("non-JSON content type", async () => {
    const result = await json(await POST(new Request("http://localhost/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        currentPassword: "old-password",
        newPassword: "new-password-8",
        confirmPassword: "new-password-8",
      }),
    })));
    assert.equal(result.status, 415);
    assert.equal(result.body.success, false);
  });
});

test("rejects blank, short, reused, and mismatched passwords", async (t) => {
  const { POST } = loadRoute({ session: authenticatedSession() });
  const cases = [
    {
      name: "blank current password",
      body: { currentPassword: "   ", newPassword: "new-pass-8", confirmPassword: "new-pass-8" },
    },
    {
      name: "blank new password",
      body: { currentPassword: "old-password", newPassword: "        ", confirmPassword: "        " },
    },
    {
      name: "blank confirmation",
      body: { currentPassword: "old-password", newPassword: "new-pass-8", confirmPassword: "   " },
    },
    {
      name: "short new password",
      body: { currentPassword: "old-password", newPassword: "short7", confirmPassword: "short7" },
    },
    {
      name: "reused password",
      body: { currentPassword: "same-password", newPassword: "same-password", confirmPassword: "same-password" },
    },
    {
      name: "mismatched confirmation",
      body: { currentPassword: "old-password", newPassword: "new-password-8", confirmPassword: "different-password-8" },
    },
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      const result = await json(await POST(request(item.body)));
      assert.equal(result.status, 400);
      assert.equal(result.body.success, false);
    });
  }
});

test("accepts a letter-only new password that meets the backend length rule", async () => {
  const fetchImpl = async () => Response.json(envelope({
    success: true,
    message: "Password changed.",
    status: 200,
  }));
  const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "abcdefgh",
    confirmPassword: "abcdefgh",
  })));

  assert.deepEqual(result, {
    status: 200,
    body: { success: true, message: "Password changed." },
  });
});

test("forwards only the exact password fields without trimming their values", async () => {
  let upstream;
  const fetchImpl = async (url, options) => {
    upstream = { url, options };
    return Response.json(envelope({ success: true, message: "Changed", status: 200 }));
  };
  const { POST } = loadRoute({
    session: authenticatedSession("Bearer BearerValue"),
    fetchImpl,
  });
  const body = {
    currentPassword: " old password ",
    newPassword: " new password 8 ",
    confirmPassword: " new password 8 ",
  };

  const response = await POST(request(body));

  assert.equal(response.status, 200);
  assert.equal(upstream.url, "https://backend.example/api/v1/auth/change-password");
  assert.equal(upstream.options.method, "POST");
  assert.equal(upstream.options.headers.Authorization, "Bearer BearerValue");
  assert.equal(upstream.options.headers["Content-Type"], "application/json");
  assert.equal(upstream.options.cache, "no-store");
  assert.equal(upstream.options.redirect, "error");
  assert.deepEqual(JSON.parse(upstream.options.body), body);
});

test("preserves backend 400, 401, and 403 statuses and messages", async (t) => {
  for (const status of [400, 401, 403]) {
    await t.test(String(status), async () => {
      const fetchImpl = async () => Response.json(
        envelope({ success: false, message: `Backend ${status}`, status }),
        { status },
      );
      const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });
      const result = await json(await POST(request({
        currentPassword: "old-password",
        newPassword: "new-password-8",
        confirmPassword: "new-password-8",
      })));

      assert.deepEqual(result, {
        status,
        body: { success: false, message: `Backend ${status}` },
      });
    });
  }
});

test("maps a 200 error envelope to a client error", async () => {
  const fetchImpl = async () => Response.json(envelope({
    success: false,
    message: "Current password is incorrect.",
    status: 200,
  }));
  const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.deepEqual(result, {
    status: 400,
    body: { success: false, message: "Current password is incorrect." },
  });
});

test("preserves a valid backend HTTP failure envelope", async () => {
  const fetchImpl = async () => Response.json(envelope({
    success: false,
    message: "Password service is unavailable.",
    status: 503,
  }), { status: 503 });
  const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.deepEqual(result, {
    status: 503,
    body: { success: false, message: "Password service is unavailable." },
  });
});

test("rejects malformed successful backend responses", async () => {
  const fetchImpl = async () => new Response("not-json", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
  const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.deepEqual(result, {
    status: 502,
    body: { success: false, message: "The account API returned an invalid response." },
  });
});

test("returns a gateway error when the backend cannot be reached", async () => {
  const { POST } = loadRoute({
    session: authenticatedSession(),
    fetchImpl: async () => { throw new Error("network unavailable"); },
  });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.deepEqual(result, {
    status: 502,
    body: { success: false, message: "The account API could not be reached. Please try again." },
  });
});

test("returns only the normalized success envelope", async () => {
  const fetchImpl = async () => Response.json({
    ...envelope({ success: true, message: "Password changed successfully.", status: 200 }),
    payload: { currentPassword: "must-not-leak" },
  });
  const { POST } = loadRoute({ session: authenticatedSession(), fetchImpl });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  })));

  assert.deepEqual(result, {
    status: 200,
    body: { success: true, message: "Password changed successfully." },
  });
});

test("rejects cross-origin form submissions without calling the backend", async () => {
  let calls = 0;
  const { POST } = loadRoute({
    session: authenticatedSession(),
    fetchImpl: async () => { calls += 1; },
  });

  const result = await json(await POST(request({
    currentPassword: "old-password",
    newPassword: "new-password-8",
    confirmPassword: "new-password-8",
  }, { Origin: "https://evil.example" })));

  assert.equal(result.status, 403);
  assert.deepEqual(result.body, { success: false, message: "Cross-origin request rejected." });
  assert.equal(calls, 0);
});
