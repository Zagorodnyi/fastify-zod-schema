import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { z } from "zod";
import { zodSchemaPlugin } from "./plugin";

import fastify from "fastify";

function getZodSchemas<T extends typeof z>(zod: T) {
  const z = zod as any
  const body = {
    body: z.object({
      data: z.number(),
    }),
    response: {
      200: z.object({
        ok: z.string(),
        body: z.object({ data: z.number() }),
      }),
    },
  };

  const headers = {
    headers: z.object({
      "x-test-header": z.string(),
    }),
    response: {
      200: z.object({
        ok: z.string(),
        headers: z.object({ "x-test-header": z.string() }),
      }),
    },
  };

  const queryParams = {
    querystring: z.object({
      page: z.coerce.number(),
      limit: z.coerce.number(),
    }),
    response: {
      200: z.object({
        ok: z.string(),
        query: z.object({
          page: z.number(),
          limit: z.number(),
        }),
      }),
    },
  };
  return {
    body,
    queryParams,
    headers,
  };
}

function buildFastify(plugin: any, { body: bodySchema, headers: headersSchema, queryParams: queryParamsSchema }: any) {
  const app = fastify();

  app.register(plugin);
  app.post("/", { schema: bodySchema }, function (request, reply) {
    reply.send({ ok: "yes", body: request.body });
  });

  app.post("/headers", { schema: headersSchema }, function (request, reply) {
    reply.send({ ok: "yes", headers: { "x-test-header": request.headers["x-test-header"] } });
  });

  app.post("/query", { schema: queryParamsSchema }, function (request, reply) {
    reply.send({ ok: "yes", query: request.query });
  });

  return app;
}



describe("V3", () => {
  const app = buildFastify(zodSchemaPlugin, getZodSchemas(z));

  test("Body parsing", async () => {
    const { json } = await app.inject({
      method: "POST",
      url: "/",
      body: { data: 12 },
    });

    assert.deepStrictEqual(json(), { ok: "yes", body: { data: 12 } });
  });

  test("Headers parsing", async (t) => {
    const res1 = await app.inject({
      method: "POST",
      url: "/headers",
      headers: {
        "x-test-header": "test",
      },
    });

    assert.deepStrictEqual(res1.json(), { ok: "yes", headers: { "x-test-header": "test" } });

    const res2 = await app.inject({
      method: "POST",
      url: "/headers",
      headers: {},
    });

    assert.equal(res2.statusCode, 400);
    assert.equal(res2.json().code, "FST_ERR_VALIDATION");
  });

  test("Query parsing", async (t) => {
    const res1 = await app.inject({
      method: "POST",
      url: "/query?page=1&limit=100",
    });

    assert.deepStrictEqual(res1.json(), { ok: "yes", query: { page: 1, limit: 100 } });

    const res2 = await app.inject({
      method: "POST",
      url: "/query?page=1&limit=invalid",
    });

    assert.partialDeepStrictEqual(res2.json(), { statusCode: 400, error: "Bad Request", code: "FST_ERR_VALIDATION" });
  });
});
