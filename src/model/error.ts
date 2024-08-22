export class DuplicateError extends Error {
    statusCode = 409;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends Error {
    statusCode = 404;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UnauthorizedError extends Error {
    statusCode = 401;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForbiddenError extends Error {
    statusCode = 403;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class BadRequestError extends Error {
    statusCode = 400;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class InternalServerError extends Error {
    statusCode = 500;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}
