import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';

async function startApolloServer() {
    const server = new ApolloServer({typeDefs, resolvers});
    const port = parseInt(process.env.PORT);

    try {
        const { url } = await startStandaloneServer(server, {
            context: async ({ req, res }) => { return req }, // Pass request Object
            listen: { port },
        });

        console.log(`🚀  Server ready at ${url} 🚀`);
    }catch(err){
        console.error(err);
    }
}

startApolloServer();
