import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(handler(request, response, next)).catch(next)
  }
}

export function errorHandler(error: unknown, _request: Request, response: Response, next: NextFunction) {
  void next

  if (error instanceof ZodError) {
    return response.status(400).json({
      error: 'VALIDATION_ERROR',
      issues: error.issues,
    })
  }

  if (error instanceof HttpError) {
    return response.status(error.status).json({ error: error.message })
  }

  console.error(error)
  return response.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
}
