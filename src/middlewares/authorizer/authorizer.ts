import { JwtService } from "@/libs/services/jwt/jwtService";
import { Users } from "@/libs/services/mongo/schema";
import { User } from "@/libs/services/mongo/types";
import { NextFunction, Request, Response } from "express";

export async function authorizeRequest(req: { userInfo: User } & Request, res: Response, next: NextFunction) {
    
   try {
    const bearerToken = req.headers.authorization

    if (!bearerToken) {
        return res.status(401).send('Unauthorized');
    }

    const [bearer, token] = bearerToken.split(' ')

    if (!bearer || !token) {
        return res.status(401).send('Unauthorized');
    }

    const jwtService = new JwtService()
    const payload = await jwtService.decodeUserToken<{ phoneNumber: string }>(token)

    // Getting user info from the db
    const userInfo = await Users.findOne({ phoneNumber: payload?.phoneNumber })

    if (!userInfo) {
        return res.status(401).send(`User not found for phone number : ${payload?.phoneNumber}`)
    }

    // Adding user info to the request object
    req.userInfo = userInfo

    next();
    
   } catch (error) {
    res.status(401).send({message:"Unauthorized",error})
   }
}