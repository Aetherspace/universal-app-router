module.exports = {
    pluginsConfig: {
        branches: [
            'nativewind',
            'portability-patterns',
            'mdx',
            'graphql-server-apollo',
            'react-query',
        ],
        nestedMetaData: {
            "nativewind": {
                "title": "Nativewind",
                "route": "/plugins/nativewind"
            },
            "portability-patterns": {
                "title": "React Portability Patterns",
                "route": "/plugins/portability-patterns"
            },
            "mdx": {
                "title": "Universal MDX",
                "route": "/plugins/mdx"
            },
            "graphql-server-apollo": {
                "title": "GraphQL Server (Apollo)",
                "route": "/plugins/graphql-server-apollo"
            },
            "react-query": {
                "title": "@tanstack/react-query",
                "route": "/plugins/react-query"
            }
        }
    }
}
