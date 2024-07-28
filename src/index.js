"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodSchemaPlugin = void 0;
const fast_json_stringify_1 = __importDefault(require("fast-json-stringify"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
require("./modules");
function zodSchemaPlugin(fastify, params, done) {
    fastify.setValidatorCompiler(({ schema, method, url, httpPart }) => {
        return data => {
            try {
                const parsed = schema.parse(data);
                return { value: parsed };
            }
            catch (err) {
                return { error: err };
            }
        };
    });
    fastify.setSerializerCompiler(({ schema, method, url, httpStatus, contentType }) => {
        const jsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(schema);
        const stringify = (0, fast_json_stringify_1.default)(jsonSchema);
        return data => {
            const result = schema.safeParse(data);
            return stringify(result.success ? result.data : data);
        };
    });
    done();
}
exports.zodSchemaPlugin = zodSchemaPlugin;
//@ts-ignore
zodSchemaPlugin[Symbol.for('skip-override')] = true;
