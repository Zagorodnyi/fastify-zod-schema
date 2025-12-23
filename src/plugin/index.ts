import type { FastifyInstance } from "fastify";
import fastJson from "fast-json-stringify";
import z from "zod";

import "./modules.d.ts";

function zodSchemaPlugin(fastify: FastifyInstance, params: Params, done: (err?: any) => void) {
  fastify.setValidatorCompiler<z.Schema>(({ schema, method, url, httpPart }) => {
    return (data) => {
      try {
        const parsed = schema.parse(data);
        return { value: parsed };
      } catch (err: any) {
        return { error: err };
      }
    };
  });

  fastify.setSerializerCompiler<z.Schema>(({ schema, method, url, httpStatus, contentType }) => {
    const jsonSchema = z.toJSONSchema(schema, {
      ...params,
      target: params.target || "draft-7",
      unrepresentable: params.unrepresentable || "any",
      override: (ctx) => {
        if(params.override) {
          return params.override(ctx)
        }

        const def = ctx.zodSchema._zod.def;
        if (def.type === "date") {
          ctx.jsonSchema.type = "string";
          ctx.jsonSchema.format = "date-time";
        }
      },
    });
    const stringify = fastJson(jsonSchema as any);
    return (data) => {
      const result = schema.safeParse(data);
      return stringify(result.success ? result.data : data);
    };
  });

  done();
}

//@ts-ignore
zodSchemaPlugin[Symbol.for("skip-override")] = true;

export { zodSchemaPlugin };

type Params = {
  /** How to handle unrepresentable types.
   * - `"any"` — Default. Unrepresentable types become `{}`
   * - `"throw"` — Unrepresentable types throw an error */
  unrepresentable?: "throw" | "any";

  /**
   * Some schema types have different input and output types, e.g. ZodPipe, ZodDefault, and coerced primitives.
   * By default, the result of z.toJSONSchema represents the output type; use "io": "input" to extract the input type instead
   */
  io?: "input" | "output";

  /** The JSON Schema version to target.
   * - `"draft-07"` — Default. JSON Schema Draft 7
   * - `"draft-2020-12"` — JSON Schema Draft 2020-12
   * - `"draft-04"` — JSON Schema Draft 4
   * - `"openapi-3.0"` — OpenAPI 3.0 Schema Object */
  target?:
    | "draft-04"
    | "draft-4"
    | "draft-07"
    | "draft-7"
    | "draft-2020-12"
    | "openapi-3.0"
    | ({} & string)
    | undefined;

  /** How to handle cycles.
   * - `"ref"` — Default. Cycles will be broken using $defs
   * - `"throw"` — Cycles will throw an error if encountered */
  cycles?: "ref" | "throw";

  override?: (ctx: {
    zodSchema: z.core.$ZodTypes;
    jsonSchema: z.core.JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void | undefined;
};
