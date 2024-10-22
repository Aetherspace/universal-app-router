## Build a data resolver (API route + GraphQL)

```shell
@app/core
 └── /resolvers/... # <- Reusable back-end logic goes here
```

Let's link an Input schema and Output schema to some business logic:

```ts
/* -- Schemas ------------ */

// Input validation
export const HealthCheckInput = schema('HealthCheckInput', {

    echo: z.string()
        .default('Hello World!')
        .describe("Echo'd back in the response"), // Docs

    logUser: z.boolean().default(false),
})

// Output definition
export const HealthCheckOutput = schema('HealthCheckOutput', {

    echo: HealthCheckInput.shape.echo, // 1 of many ways to reuse defs

    user: User.nullish(), // We'll only add it if 'logUser' = true
    //    ☝️ You can nest schemas to reuse them in another
})
```

To be able to reuse these on the front-end later, you'll want to already combine them as a "bridge":

`healthCheck.bridge.ts`

```ts
import { createDataBridge } from '@green-stack/schemas/createDataBridge' 

/* -- Bridge ------------- */

export const healthCheckBridge = createDataBridge({
    // Assign schemas
    inputSchema: HealthCheckInput,
    outputSchema: HealthCheckOutput,

    // GraphQL config
    resolverName: 'healthCheck',
    resolverArgsName: 'HealthCheckInput',

    // API route config
    apiPath: '/api/health',
    allowedMethods: ['GRAPHQL', 'GET'],
})
```

> Think of a "Databridge" as a literal bridge between the front and back-end.

It's an object you can use from either side to provide / transform into:

- ✅ Input and output types and validation
- ✅ GraphQL schema definitions in `schema.graphql`
- ✅ The query string to call our GraphQL api with

For now, let's connect it to our actual server-side business logic:

`healthCheck.resolver.ts`

```ts
import { createResolver } from '@green-stack/schemas/createResolver'
import { healthCheckBridge } from './healthCheck.bridge.ts'

/** --- healthCheck() ---- */
/** -i- Check the health status of the server. */
export const healthCheck = createResolver(async ({
    args,
    context, // <- Request context (from middleware)
    parseArgs, // <- Input validator (from 'inputSchema')
    withDefaults, // <- Response helper (from 'outputSchema')
}) => {
    
    // Auto typed input:
    const { echo, logUser } = args

    // -- OR --

    // Validate and apply defaults
    const { echo, logUser } = parseArgs(args)

    // -- ... --

    // Add business logic
    // - e.g. use the request 'context' to log out current user
    const { user } = context // *example, requires auth middleware

    // Typecheck response and apply defaults from bridge's outputSchema
    return withDefaults({
        echo, 
        user: logUser ? user : null
    })

}, healthCheckBridge)
// ☝️ Provide the bridge as the 2nd argument to:
// - infer the types
// - enable the parseArgs() and withDefaults() helpers
```

By itself, `healthCheck()` is now just another async function you can use anywhere in your back-end:

```ts
import { healthCheck } from '../../healthCheck.resolver'

const someResolverOrScript = async () => {

    // Reuse anywhere else serverside
    const result = await healthCheck({
        echo: 'Hello from another function!',
        logUser: false,
    })

    // ...
}
```

The difference with a regular function though is that since the logic is now bundled together with it's DataBridge / input + output config, we can easily transform it into an API route:

### Turning the resolver into an API route handler

```shell
@app/core
 └── /resolvers/...
 └── /routes/...
     └── /api/... # <- Define API routes at this level
```

`/api/health/route.ts` <- Next.js style file conventions

```ts
import { healthCheck } from '@app/resolvers/healthCheck.resolver'
import { createNextRouteHandler } from '@green-stack/schemas/createNextRouteHandler'

/* --- Routes ------------ */

export const GET = createNextRouteHandler(healthCheck)
// Automatically extracts (☝️) args from url & search params

// If you want to support e.g. POST (👇)
export const POST = createNextRouteHandler(healthCheck)
```

> Check [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) later for a deeper understanding

### Attaching the resolver to a GraphQL schema

To enable GraphQL for this resolver the flow is very similar.

In the same file, add the following:

`/api/health/route.ts`

```ts
import { healthCheck } from '@app/resolvers/healthCheck.resolver'
import { createGraphResolver } from '@green-stack/schemas/createGraphResolver'

/* --- Routes ------------ */

// exports of your `GET` / `POST` / `PUT` / ...

/* --- GraphQL ----------- */

export const graphResolver = createGraphResolver(healthCheck)
// Automatically extracts args from graphql request (☝️)
```

Exporting `graphResolver` by itself won't do much.

We need to register it using one of our scripts first:

```shell
npm run collect:resolvers # This runs automatically in dev 🙏
```

```shell
> @fullproduct-dot-dev/universal-app-router@1.0.0 collect:resolvers
> npx turbo run @green-stack/core collect:resolvers

• Packages in scope: @app/core, @app/expo, @app/next, @green-stack/core
• Running @green-stack/core collect:resolvers in 7 packages

@green-stack/core: 
@green-stack/core: > @green-stack/core@0.0.1 collect:resolvers
@green-stack/core: > npm run run:script ./scripts/collect-resolvers.ts
@green-stack/core: 
@green-stack/core: ----------------------------------------------
@green-stack/core: -i- Successfully created resolver registry at:
@green-stack/core: ----------------------------------------------
@green-stack/core:  ✅ packages/@registries/resolvers.generated.ts

 Tasks:    1 successful, 1 total
Cached:    0 cached, 1 total
```

This will:
1. pick up the `graphResolver` export
2. put it in our list of graphql compatible resolvers ...
3. ... by adding it in `resolvers.generated.ts` at `@app/resigstries`

Finally:  

4. When next running `dev`, also executes `npm run build:schema`
5. Which recreates `schema.graphql` from input & output schemas

> ✅ You've successfully automated some of the boring parts of GraphQL 🎉

Check out your GraphQL API at [/api/graphql](http://localhost:3000/api/graphql)
