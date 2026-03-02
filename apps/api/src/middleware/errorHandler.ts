import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const error = err instanceof Error ? err : new Error('Unknown error');

  const status = (error as any).statusCode || (error as any).status || 500;
  const isServerError = status >= 500;
  const message = isServerError
    ? 'Internal Server Error'
    : error.message || 'Request failed';

  // Log full error with stack on the server
  console.error(error.stack || error);

  // Never expose stack traces to the client
  res.status(status).json({
    error: message,
    status,
  });
}
