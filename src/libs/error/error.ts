export class BadRequestExecption extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'BadRequestException';
        this.statusCode = 400;
    }
}

export class EnvNotFoundError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'EnvNotFoundError';
        this.statusCode = 500;
    }
}

export class ConnectionError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'ConnectionError';
        this.statusCode = 500; // Internal Server Error
    }
}

export class NotProvidedError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'NotProvidedError';
        this.statusCode = 400; 
    }
}

export class DbError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'DbError';
        this.statusCode = 500; 
    }
}
export class Unauthorized extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'Unauthorized';
        this.statusCode = 401; 
    }
}
