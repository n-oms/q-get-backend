import { JwtService } from './jwtService';
import jwt from 'jsonwebtoken';
import { EnvNotFoundError, UnauthorizedException } from '../../error/error';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JwtService', () => {
    let jwtService: JwtService;
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        // Store the original env variables
        originalEnv = { ...process.env };
    });

    beforeEach(() => {
        // Reset env variables before each test
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'testsecret',
            JWT_EXPIRY: '1h'
        };
        jwtService = new JwtService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original env variables
        process.env = originalEnv;
    });

    describe('createUserToken', () => {
        it('should create a token with the phone number', async () => {
            const phoneNumber = '1234567890';
            const token = 'testtoken';
            (jwt.sign as jest.Mock).mockReturnValue(token);

            const result = await jwtService.createUserToken({ phoneNumber });

            expect(jwt.sign).toHaveBeenCalledWith(
                { phoneNumber }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRY }
            );
            expect(result).toBe(token);
        });

        it('should throw EnvNotFoundError if JWT_SECRET is not found', async () => {
            // Create a new env object without JWT_SECRET
            process.env = {
                ...process.env,
                JWT_SECRET: undefined
            };

            await expect(
                jwtService.createUserToken({ phoneNumber: '1234567890' })
            ).rejects.toThrow(EnvNotFoundError);
        });

        it('should throw EnvNotFoundError if JWT_EXPIRY is not found', async () => {
            // Create a new env object without JWT_EXPIRY
            process.env = {
                ...process.env,
                JWT_EXPIRY: undefined
            };

            await expect(
                jwtService.createUserToken({ phoneNumber: '1234567890' })
            ).rejects.toThrow(EnvNotFoundError);
        });
    });

    describe('decodeUserToken', () => {
        it('should decode the token and return the payload', async () => {
            const token = 'testtoken';
            const payload = { phoneNumber: '1234567890' };
            (jwt.verify as jest.Mock).mockReturnValue(payload);

            const result = await jwtService.decodeUserToken<typeof payload>(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
            expect(result).toEqual(payload);
        });

        it('should throw EnvNotFoundError if JWT_SECRET is not found', async () => {
            // Create a new env object without JWT_SECRET
            process.env = {
                ...process.env,
                JWT_SECRET: undefined
            };

            await expect(
                jwtService.decodeUserToken('testtoken')
            ).rejects.toThrow(EnvNotFoundError);
        });

        it('should throw UnauthorizedException if jwt verification fails', async () => {
            const token = 'testtoken';
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('jwt verification failed');
            });

            await expect(
                jwtService.decodeUserToken(token)
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});