import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url} - Status: ${statusCode} - Message: ${message}`);
  if (err.stack) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
