# fastify-zod-schema

`fastify-zod-schema` is a Fastify plugin that allows users to define request schemas using **Zod v4**, providing type safety and validation.

### Zod versions support
- v1.x.x - Zod v3 (default)
- v2.x.x - Zod v4

_The `main` branch is for the latest version. v1 is supported and updated in a separate branch._


## Installation

To install the package, use npm:

```bash
npm install fastify-zod-schema
```

## Usage

First, register the plugin in your Fastify app:

```ts
import fastify from 'fastify'
import { zodSchemaPlugin } from 'fastify-zod-schema'

const app = fastify()

app.register(zodSchemaPlugin);
```

## Defining Schemas

With `fastify-zod-schema`, you can define your request schemas using Zod. Below are some examples of usage with Fastify routes.


### Example 1: Basic Route Validation
```js
import z from 'zod/v4'

const schema = {
  body: z.object({
    name: z.string(),
    age: z.number().int().positive(),
  }),
};

app.post('/user', { schema }, async (req, rep) => {
  const { name, age } = req.body;
  return { name, age };
});
```

### Example 2: Query Parameters Validation

```js
import z from 'zod/v4'

const schema = {
  querystring: z.object({
    search: z.string().min(1),
    limit: z.number().int().positive().optional(),
  }),
};

app.get('/search', { schema }, async (req, rep) => {
  const { search, limit } = req.query;
  return { search, limit };
});
```

### Example 3: Headers Validation

```js
import z from 'zod/v4'

const schema = {
  headers: z.object({
    'x-api-key': z.string().uuid(),
  }),
};

app.get('/protected', { schema }, async (req, rep) => {
  const apiKey = req.headers['x-api-key'];
  return { apiKey };
});
```

### Example 4: Combining Body, Query, Headers and Response Validation

```js
import z from 'zod/v4'

const schema = {
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(6),
  }),
  querystring: z.object({
    role: z.string().optional(),
  }),
  headers: z.object({
    'x-api-key': z.string().min(1),
  }),
  response: {
    200: z.object({
      username: z.string().min(1),
      role: z.string().optional(),
    })
  }
};

app.post('/login', { schema }, async (req, rep) => {
  const { username, password } = req.body;
  const { role } = req.query;
  const apiKey = req.headers['x-api-key'];
  return { username, role };
});
```

### Caveats
- Version 4 is using zod native toJSONSchema transformer so all its restrictions and limitations are expected here as well. See [Zod Docs](https://zod.dev/json-schema#unrepresentable)
- Plugin configuration for customizing the `toJsonSchema` method will be added in future versions.

## License

MIT
