import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from './env.js'
import { HttpError } from './http.js'
import { prisma } from './prisma.js'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
})

export type AuthenticatedRequest = Request & {
  user: {
    id: string
    email: string
    role: string
  }
}

export function signAccessToken(user: { id: string; email: string; role: string }) {
  const options: jwt.SignOptions = { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    options,
  )
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const header = request.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    return next(new HttpError(401, 'AUTH_TOKEN_REQUIRED'))
  }

  try {
    const payload = tokenPayloadSchema.parse(jwt.verify(token, env.jwtSecret))
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return next(new HttpError(401, 'AUTH_USER_NOT_FOUND'))
    }

    ;(request as AuthenticatedRequest).user = user
    return next()
  } catch {
    return next(new HttpError(401, 'AUTH_TOKEN_INVALID'))
  }
}
