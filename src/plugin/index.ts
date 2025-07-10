import type { FastifyInstance } from 'fastify'
import fastJson from 'fast-json-stringify'
import { z as v4 } from 'zod/v4'

import './modules.d.ts'

function zodSchemaPlugin(fastify: FastifyInstance,  params: any, done: (err?: any) => void) {
  fastify.setValidatorCompiler<v4.Schema>(({ schema, method, url, httpPart }) => {
    return data => {
      try {
        const parsed = schema.parse(data)
        return { value: parsed }
      } catch (err: any) {
        return { error: err }
      }
    }
  })

  fastify.setSerializerCompiler<v4.Schema>(({ schema, method, url, httpStatus, contentType }) => {
    const jsonSchema = v4.toJSONSchema(schema, { target: 'draft-7' })
    const stringify = fastJson(jsonSchema as any)
    return data => {
      const result = schema.safeParse(data)
      return stringify(result.success ? result.data : data)
    }
  })

  done()
}


//@ts-ignore
zodSchemaPlugin[Symbol.for('skip-override')] = true

export { zodSchemaPlugin }
