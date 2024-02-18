import { Prisma } from '../../db.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { AuthenticationError } from '../utils/errors.js';
import { isAuthenticated } from '../utils/auth.js';

interface LoginInput {
    email:string
    password:string
}

interface CreateUserInput {
    email:string
    password:string
}

interface CreateApartmentInput{
    title:string
    location:Location
}

interface SearchApartmentsInput{
    title:string
    location:Location
}

interface Location{
    country: string
    city: string
    streetName: string
    streetNumber: string
    latitude: number
    longitude: number
}

interface GeolocationInput{
    city:string
    latitude:number
    longitude:number
    distance: number
}

interface FavoriteInput{
    id:number
}

export const resolvers = {
    Query: {
        login: async (_parent:any, args:LoginInput) => {
            const user = await Prisma.user.findFirst({where: { email: args.email }})
            if(user){
                const passwordValid = await bcrypt.compare(args.password, user.password);
                if(passwordValid){
                    const token = jwt.sign(user, process.env.JWT_KEY, {algorithm: "HS256", expiresIn: process.env.JWT_TTL})
                    return token
                }else{
                    throw AuthenticationError()
                }        
            }
        },
        searchApartments: async(_parent:any, args:SearchApartmentsInput) => {
            const apartments = await Prisma.apartment.findMany({ 
                where: {
                    title: { contains: args.title },
                    location: {
                        country: args?.location?.country,
                        city: args?.location?.city,
                        streetName: args?.location?.streetName,
                        streetNumber: args?.location?.streetNumber,
                        latitude: args?.location?.latitude,
                        longitude: args?.location?.longitude
                    }
                },
                include:{
                    location: true
                },
                take: 16
            })

            return apartments
        },
        searchApartmentsByGeoLocation: async(_parent:any, args:GeolocationInput) => {
            
            // Math methods not supported with Prisma SQLite
            const distancePower = args.distance*args.distance
            let apartments = await Prisma.$queryRaw`SELECT Apartment.id FROM Apartment INNER JOIN Location ON Apartment.locationId=Location.id WHERE ( (Location.latitude-${args.latitude})*(Location.latitude-${args.latitude}) + (Location.longitude-${args.longitude})*(Location.longitude-${args.longitude}) ) <= ${distancePower}`
            apartments = (apartments as Array<any>).map(x => x.id)
            
            const apartmentsResult = await Prisma.apartment.findMany({
                where:{
                    id: {
                        in: apartments as Array<number>
                    }
                },
                include:{
                    location: true
                },
                take: 16
            })

            return apartmentsResult
        },
        getFavorites: async(_parent:any, args:any, req:any) => {
            const user = isAuthenticated(req)

            let favorites = await Prisma.favorite.findMany({where: { userId: user.id } })
            let apartmentIds = favorites.map(x => x.apartmentId)
            const apartments = await Prisma.apartment.findMany({
                where: {
                    id: { in: apartmentIds }
                },
                include: {
                    location: true
                },
                take: 16
            })

            return apartments
        }
    },

    Mutation: {
        createUser: async(_parent:any, args:CreateUserInput) => {
            const hashedPassword = await bcrypt.hash(args.password, 10);
            const user = await Prisma.user.create({
                data:{
                    email: args.email,
                    password: hashedPassword
                }
            })

            return user
        },
        createApartment: async(_parent:any, args:CreateApartmentInput, req:any) => {
            const user = isAuthenticated(req)
            
            const location = await Prisma.location.create({
                data: {
                    country: args.location.country,
                    city: args.location.city,
                    streetName: args.location.streetName,
                    streetNumber: args.location.streetNumber,
                    latitude: args.location.latitude,
                    longitude: args.location.longitude
                }
            })

            const apartment = await Prisma.apartment.create({
                data:{
                    title: args.title,
                    userId: user.id,
                    locationId: location.id
                },
                include: {
                    location: true,
                },
            })

            return apartment
        },
        markAsFavorite: async(_parent:any, args:FavoriteInput, req:any) => {
            const user = isAuthenticated(req)

            const favorite = await Prisma.favorite.create({
                data: {
                    userId: user.id,
                    apartmentId: args.id
                }
            })

            return favorite.id
        }
    }
}