import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.js";

const allowedOrigin = "https://sudojacky.github.io";

function createEnv(count = 1) {
  let calls = 0;

  return {
    ALLOWED_ORIGINS: `${allowedOrigin},http://localhost:5173`,
    DB: {
      prepare() {
        calls += 1;
        return {
          bind() {
            return {
              async first() {
                return { count };
              },
            };
          },
        };
      },
    },
    getCalls() {
      return calls;
    },
  };
}

function request(method, origin = allowedOrigin, path = "/api/visit") {
  return new Request(`https://counter.example${path}`, {
    method,
    headers: origin ? { Origin: origin } : undefined,
  });
}

test("increments and returns the site visit count", async () => {
  const env = createEnv(42);
  const response = await worker.fetch(request("POST"), env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), allowedOrigin);
  assert.deepEqual(await response.json(), { count: 42 });
  assert.equal(env.getCalls(), 1);
});

test("answers an allowed CORS preflight without touching D1", async () => {
  const env = createEnv();
  const response = await worker.fetch(request("OPTIONS"), env);

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.equal(env.getCalls(), 0);
});

test("rejects an unapproved origin without touching D1", async () => {
  const env = createEnv();
  const response = await worker.fetch(request("POST", "https://example.com"), env);

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(env.getCalls(), 0);
});

test("rejects unsupported methods", async () => {
  const env = createEnv();
  const response = await worker.fetch(request("GET"), env);

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST, OPTIONS");
  assert.equal(env.getCalls(), 0);
});

test("returns 404 outside the counter endpoint", async () => {
  const env = createEnv();
  const response = await worker.fetch(request("POST", allowedOrigin, "/"), env);

  assert.equal(response.status, 404);
  assert.equal(env.getCalls(), 0);
});
