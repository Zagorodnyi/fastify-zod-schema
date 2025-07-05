import { before, describe, test } from "node:test";
import assert from "node:assert/strict";

import fastify, { FastifyInstance } from "fastify";
import * as z from "zod/v4";

import { zodSchemaPlugin } from "./plugin";

describe("General", () => {
  let app: FastifyInstance;

  before(() => {
    app = buildFastify();
  });

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

const bodySchema = {
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

const headersSchema = {
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

const queryParamsSchema = {
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

function buildFastify() {
  const app = fastify();

  app.register(zodSchemaPlugin);
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
