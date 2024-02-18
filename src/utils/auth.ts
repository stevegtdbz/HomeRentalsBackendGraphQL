
import { AuthenticationError } from './errors.js';
import jwt from 'jsonwebtoken'

export const isAuthenticated = (req:any) => {  
	try{
        const token = req?.headers?.authorization?.replace("Bearer","").trim()
        if(!token) throw AuthenticationError()
		return jwt.verify(token, process.env.JWT_KEY)
	}catch(e){
        throw AuthenticationError()
	}
}
