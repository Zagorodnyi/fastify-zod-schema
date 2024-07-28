import { Schema, z } from "zod";
declare module "fastify" {
    interface FastifyTypeProviderDefault {
        output: this["input"] extends Schema ? z.infer<this["input"]> : unknown;
    }
}
export {};
//# sourceMappingURL=modules.d.ts.map