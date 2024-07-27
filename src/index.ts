import type { FastifyInstance } from 'fastify'
import fastJson from 'fast-json-stringify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import './modules'


function registerZod(fastify: FastifyInstance,  params: any, done: (err?: any) => void) {
  fastify.setValidatorCompiler<z.Schema>(({ schema, method, url, httpPart }) => {
    return data => {
      try {
        const parsed = schema.parse(data)
        return { value: parsed }
      } catch (err: any) {
        return { error: err }
      }
    }
  })

  fastify.setSerializerCompiler<z.Schema>(({ schema, method, url, httpStatus, contentType }) => {
    const jsonSchema = zodToJsonSchema(schema)
    const stringify = fastJson(jsonSchema as any)

    return data => {
      const result = schema.safeParse(data)
      return stringify(result.success ? result.data : data)
    }
  })

  done()
}

//@ts-ignore
registerZod[Symbol.for('skip-override')] = true
export { registerZod }
