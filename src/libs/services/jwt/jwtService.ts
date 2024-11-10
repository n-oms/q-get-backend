import { env } from '@/env/env';
import { EnvNotFoundError, UnauthorizedException } from '@/libs/error/error';
import jwt from 'jsonwebtoken';



export class JwtService {

    // Create a token with the phone number
    async createUserToken({ phoneNumber }: { phoneNumber: string }) {
        const secret = env.JWT_SECRET;
        const expiry = env.JWT_EXPIRY;
        if (!secret) {
            throw new EnvNotFoundError('JWT_SECRET not found in the environment variables');
        }
        if (!expiry) {
            throw new EnvNotFoundError('JWT_EXPIRY not found in the environment variables');
        }
        return jwt.sign({ phoneNumber }, secret, { expiresIn: expiry});
    }

    // Decode the token and return the payload
    async decodeUserToken<T>(token: string) {
        try {
            const secret = env.JWT_SECRET;
            if (!secret) {
                throw new EnvNotFoundError('JWT_SECRET not found in the environment variables');
            }
            const decoded = jwt.verify(token, secret);
            const payload = typeof decoded === 'string' ? JSON.parse(decoded) : decoded
            return payload as T
        } catch (error) {
           throw new UnauthorizedException("jwt verification failed"); 
        }

    }
}
