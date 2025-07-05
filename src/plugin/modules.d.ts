import type {
  FastifyTypeProvider,
  FastifyPluginOptions,
  RawServerBase,
  RawServerDefault,
  FastifyPluginCallback,
  FastifyPluginAsync,
} from "fastify";
import { z } from "zod/v4";

declare module "fastify" {
  interface FastifyTypeProviderDefault {
    validator: this["schema"] extends z.ZodType ? z.infer<this["schema"]> : unknown;
    serializer:  this["schema"] extends z.ZodType ? z.infer<this["schema"]> : unknown;
  }
}

export { }
