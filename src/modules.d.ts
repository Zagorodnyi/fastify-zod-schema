import type {
  FastifyTypeProvider,
  FastifyPluginOptions,
  RawServerBase,
  RawServerDefault,
  FastifyPluginCallback,
  FastifyPluginAsync,
} from "fastify";
import { Schema, z } from "zod";

declare module "fastify" {
  interface FastifyTypeProviderDefault {
    output: this["input"] extends Schema ? z.infer<this["input"]> : unknown;
  }
}
