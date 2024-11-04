import { Schema, z } from "zod";
declare module "fastify" {
    interface FastifyTypeProviderDefault {
        validator: this["schema"] extends Schema ? z.infer<this["schema"]> : unknown;
        serializer: this["schema"] extends Schema ? z.infer<this["schema"]> : unknown;
    }
}
export {};
//# sourceMappingURL=modules.d.ts.map