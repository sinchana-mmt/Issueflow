export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function notFound(message = "Not found") {
  return new AppError(404, "NOT_FOUND", message);
}

export function forbidden(message = "You do not have permission to do that") {
  return new AppError(403, "FORBIDDEN", message);
}

export function conflict(message: string) {
  return new AppError(409, "CONFLICT", message);
}
