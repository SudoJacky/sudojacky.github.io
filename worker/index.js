const COUNTER_NAME = "site_pv";

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return Response.json(data, { ...init, headers });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;

  return env.ALLOWED_ORIGINS
    .split(",")
    .map((allowedOrigin) => allowedOrigin.trim())
    .includes(origin);
}

async function incrementCounter(db) {
  const row = await db
    .prepare(`
      INSERT INTO counters (name, value)
      VALUES (?, 1)
      ON CONFLICT (name) DO UPDATE SET
        value = value + 1,
        updated_at = CURRENT_TIMESTAMP
      RETURNING value AS count
    `)
    .bind(COUNTER_NAME)
    .first();

  if (!row || !Number.isSafeInteger(row.count)) {
    throw new Error("D1 did not return a valid counter value.");
  }

  return row.count;
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== "/api/visit") {
      return json({ error: "Not found." }, { status: 404 });
    }

    const origin = request.headers.get("Origin");
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed." }, { status: 403 });
    }

    const headers = corsHeaders(origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed." },
        { status: 405, headers: { ...headers, Allow: "POST, OPTIONS" } },
      );
    }

    try {
      const count = await incrementCounter(env.DB);
      return json({ count }, { headers });
    } catch (error) {
      console.error("Failed to increment site visit counter.", {
        counter: COUNTER_NAME,
        error,
      });
      return json({ error: "Failed to update visit counter." }, { status: 500, headers });
    }
  },
};
