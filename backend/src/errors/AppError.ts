/** An error that carries the HTTP status code it should be reported with. */
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}