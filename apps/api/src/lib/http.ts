export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export const notFound = (message = "Resource not found") => new HttpError(404, message);
export const unauthorized = (message = "Authentication required") => new HttpError(401, message);
export const badRequest = (message = "Bad request") => new HttpError(400, message);
