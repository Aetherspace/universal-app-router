import { ApolloServer } from '@apollo/server'
import type { NextRequest } from 'next/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { createRequestContext } from '../middleware/createRequestContext'
import { schemaBundle } from './schema'

/* --- Apollo Server --------------------------------------------------------------------------- */

export const graphqlServer = new ApolloServer({
    typeDefs: schemaBundle.typeDefs,
    resolvers: schemaBundle.resolvers,
    introspection: true,
})

/** --- createGraphQLServerHandler() ----------------------------------------------------------- */
/** -i- Create the apollo graphql server handler for Next.js API router and provides context to resolvers */
export const createGraphQLServerHandler = () => {
    return startServerAndCreateNextHandler(graphqlServer, {
        context: async (req: NextRequest) => {
            return await createRequestContext({ req })
        },
    })
}
