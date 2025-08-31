import type {
  FastifyTypeProvider,
  FastifyPluginOptions,
  RawServerBase,
  RawServerDefault,
  FastifyPluginCallback,
  FastifyPluginAsync,
} from "fastify";
import type { input, output } from 'zod/v4/core'

declare module "fastify" {
  interface FastifyTypeProviderDefault {
    validator: output<this['schema']>
    serializer: input<this['schema']>
  }
}

export { }
