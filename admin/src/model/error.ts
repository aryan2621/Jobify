export const isRecognisedError = (error: any) => {
    return (
        error instanceof DuplicateError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof ForbiddenError ||
        error instanceof BadRequestError
    );
};
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
