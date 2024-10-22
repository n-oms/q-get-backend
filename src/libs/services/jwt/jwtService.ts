import { env } from '@/env/env'
import jwt from 'jsonwebtoken'

export class JwtService {
    
    // Create a token with the phone number
    async createUserToken({ phoneNumber }: { phoneNumber: string }) {
        return jwt.sign({ phoneNumber }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });
    }

    // Decode the token and return the payload
    async decodeUserToken<T>(token: string) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded
            return payload as T
        } catch (error) {
            return null;
        }
    }
}
