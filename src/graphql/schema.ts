import gql from "graphql-tag";

export const typeDefs = gql`
type User {
    id:ID!
    email:String
    password:String
}

type Apartment {
    id:ID!
    title: String!
    location: Location!
}

type Location {
    id:ID!
    country: String!
    city: String!
    streetName: String!
    streetNumber: String!
    latitude: Float!
    longitude: Float!
}

input LocationInput {
    country: String!
    city: String!
    streetName: String!
    streetNumber: String!
    latitude: Float!
    longitude: Float!
}


type Query {
    login(email:String!, password:String!): String
    searchApartments(title:String, location:LocationInput): [ Apartment ]
    searchApartmentsByGeoLocation(latitude:Float!, longitude:Float!, city:String!, distance:Float!): [ Apartment ]
    getFavorites: [ Apartment ]
}

type Mutation {
    createUser(email:String!, password:String!): User
    createApartment(title:String!, location:LocationInput!): Apartment
    markAsFavorite(id:Int!): Int
}
`