import {
    GraphQLServer
} from 'graphql-yoga'

// Scalar types - String, Boolean, Int, Float, Id

// Type definitions - Application Schema
const typeDefs = `
    type Query {
        id: ID!
        title: String!
        price: Float!
        releaseYear: Int
        rating: Float
        inStock: Boolean!
        greeting(name: String): String!
        add(numbers: [Float!]!): Float!
        grades: [Int!]!
        me: User!
        post: Post!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`

// Resolvers - Functions
const resolvers = {
    Query: {
        id() {
            return 'abc12'
        },
        title() {
            return 'iPhone'
        },
        price() {
            return 1234.56
        },
        releaseYear() {
            return 2020
        },
        rating() {
            return null
        },
        inStock() {
            return true
        },
        greeting(parent, args, ctx, info) {
            if(args.name) {
                return `Hello, ${args.name}!`
            }
            return 'Hello!'
        },
        add(parent, args, ctx, info) {
            if (args.numbers.length === 0) {
                return 0
            }
            return args.numbers.reduce((accumulator, current) => accumulator + current)
        },
        grades(parent, args, ctx, info) {
            return [99, 80, 93]
        },
        me() {
            return {
                id: 'Su123',
                name: 'Susie',
                email: 'susie@example.com'
            }
        },
        post() {
            return {
                id: 'Post1',
                title: 'Node.js is the best',
                body: 'Some body about node',
                published: false
            }
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('The server is up!')
})