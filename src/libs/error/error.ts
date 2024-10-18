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

