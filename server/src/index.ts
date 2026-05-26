import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { type AuthenticatedRequest, requireAuth, signAccessToken } from './auth.js'
import { env } from './env.js'
import { asyncHandler, errorHandler, HttpError } from './http.js'
import { prisma } from './prisma.js'
import {
  assessmentCreateSchema,
  assessmentUpdateSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  runCreateSchema,
  runUpdateSchema,
  workoutCreateSchema,
  workoutExecutionSchema,
  workoutUpdateSchema,
} from './schemas.js'

const app = express()
const idParamSchema = z.object({ id: z.string().uuid() })

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

function currentUser(request: express.Request) {
  return (request as AuthenticatedRequest).user
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const safeUser = { ...user }
  delete safeUser.passwordHash
  return safeUser
}

function parseReps(reps: string) {
  return Number.parseInt(reps, 10) || 8
}

function paceSeconds(distance: number, timeMinutes: number) {
  return Math.round((timeMinutes * 60) / distance)
}

function calculateRecoveryScore(input: {
  sleep: number
  fatigue: number
  soreness: number
  workoutVolume: number
  runs: { effort: number; type: string }[]
}) {
  const hardRunLoad = input.runs.filter((run) => run.effort >= 7).length * 8
  const longRunLoad = input.runs.some((run) => run.type === 'longo') ? 10 : 0
  const strengthLoad = Math.min(input.workoutVolume / 900, 18)
  const sleepBonus = Math.max(0, input.sleep - 6) * 6
  const fatiguePenalty = input.fatigue * 5
  const sorenessPenalty = input.soreness * 4
  const raw = 78 + sleepBonus - hardRunLoad - longRunLoad - strengthLoad - fatiguePenalty - sorenessPenalty

  return Math.max(18, Math.min(96, Math.round(raw)))
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'evopace-api' })
})

app.post(
  '/api/auth/register',
  asyncHandler(async (request, response) => {
    const input = registerSchema.parse(request.body)
    const passwordHash = await bcrypt.hash(input.password, 12)

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        age: input.age,
        weight: input.weight,
        height: input.height,
        sex: input.sex,
        goal: input.goal,
        level: input.level,
        role: input.role,
        restrictions: input.restrictions,
        experience: input.experience,
      },
    })

    const token = signAccessToken(user)
    response.status(201).json({ token, user: sanitizeUser(user) })
  }),
)

app.post(
  '/api/auth/login',
  asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body)
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })

    if (!user) {
      throw new HttpError(401, 'INVALID_CREDENTIALS')
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash)

    if (!isValid) {
      throw new HttpError(401, 'INVALID_CREDENTIALS')
    }

    const token = signAccessToken(user)
    response.json({ token, user: sanitizeUser(user) })
  }),
)

app.use('/api', requireAuth)

app.get(
  '/api/me',
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: currentUser(request).id },
    })

    response.json({ user: sanitizeUser(user) })
  }),
)

app.patch(
  '/api/profile',
  asyncHandler(async (request, response) => {
    const input = profileUpdateSchema.parse(request.body)
    const user = await prisma.user.update({
      where: { id: currentUser(request).id },
      data: input,
    })

    response.json({ user: sanitizeUser(user) })
  }),
)

app.get(
  '/api/workouts',
  asyncHandler(async (request, response) => {
    const workouts = await prisma.workout.findMany({
      where: { userId: currentUser(request).id },
      include: { exercises: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    response.json({ workouts })
  }),
)

app.post(
  '/api/workouts',
  asyncHandler(async (request, response) => {
    const input = workoutCreateSchema.parse(request.body)
    const workout = await prisma.workout.create({
      data: {
        userId: currentUser(request).id,
        name: input.name,
        split: input.split,
        focus: input.focus,
        notes: input.notes,
        exercises: {
          create: input.exercises.map((exercise, index) => ({
            ...exercise,
            order: exercise.order ?? index,
          })),
        },
      },
      include: { exercises: { orderBy: { order: 'asc' } } },
    })

    response.status(201).json({ workout })
  }),
)

app.get(
  '/api/workouts/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const workout = await prisma.workout.findFirst({
      where: { id, userId: currentUser(request).id },
      include: { exercises: { orderBy: { order: 'asc' } }, executions: true },
    })

    if (!workout) {
      throw new HttpError(404, 'WORKOUT_NOT_FOUND')
    }

    response.json({ workout })
  }),
)

app.put(
  '/api/workouts/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const input = workoutUpdateSchema.parse(request.body)
    const existing = await prisma.workout.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'WORKOUT_NOT_FOUND')
    }

    const workout = await prisma.$transaction(async (tx) => {
      if (input.exercises) {
        await tx.workoutExercise.deleteMany({ where: { workoutId: id } })
      }

      return tx.workout.update({
        where: { id },
        data: {
          name: input.name,
          split: input.split,
          focus: input.focus,
          notes: input.notes,
          exercises: input.exercises
            ? {
                create: input.exercises.map((exercise, index) => ({
                  ...exercise,
                  order: exercise.order ?? index,
                })),
              }
            : undefined,
        },
        include: { exercises: { orderBy: { order: 'asc' } } },
      })
    })

    response.json({ workout })
  }),
)

app.delete(
  '/api/workouts/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const existing = await prisma.workout.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'WORKOUT_NOT_FOUND')
    }

    await prisma.workout.delete({ where: { id } })
    response.status(204).send()
  }),
)

app.post(
  '/api/workouts/:id/executions',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const input = workoutExecutionSchema.parse(request.body)
    const existing = await prisma.workout.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'WORKOUT_NOT_FOUND')
    }

    const execution = await prisma.workoutExecution.create({
      data: {
        userId: currentUser(request).id,
        workoutId: id,
        finishedAt: input.finishedAt,
        notes: input.notes,
        setExecutions: {
          create: input.sets,
        },
      },
      include: { setExecutions: true },
    })

    response.status(201).json({ execution })
  }),
)

app.get(
  '/api/runs',
  asyncHandler(async (request, response) => {
    const runs = await prisma.run.findMany({
      where: { userId: currentUser(request).id },
      orderBy: { date: 'desc' },
    })

    response.json({ runs })
  }),
)

app.post(
  '/api/runs',
  asyncHandler(async (request, response) => {
    const input = runCreateSchema.parse(request.body)
    const run = await prisma.run.create({
      data: {
        userId: currentUser(request).id,
        ...input,
        paceSeconds: paceSeconds(input.distance, input.timeMinutes),
      },
    })

    response.status(201).json({ run })
  }),
)

app.put(
  '/api/runs/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const input = runUpdateSchema.parse(request.body)
    const existing = await prisma.run.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'RUN_NOT_FOUND')
    }

    const distance = input.distance ?? existing.distance
    const timeMinutes = input.timeMinutes ?? existing.timeMinutes
    const run = await prisma.run.update({
      where: { id },
      data: {
        ...input,
        paceSeconds: paceSeconds(distance, timeMinutes),
      },
    })

    response.json({ run })
  }),
)

app.delete(
  '/api/runs/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const existing = await prisma.run.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'RUN_NOT_FOUND')
    }

    await prisma.run.delete({ where: { id } })
    response.status(204).send()
  }),
)

app.get(
  '/api/assessments',
  asyncHandler(async (request, response) => {
    const assessments = await prisma.bodyAssessment.findMany({
      where: { userId: currentUser(request).id },
      orderBy: { date: 'asc' },
    })

    response.json({ assessments })
  }),
)

app.post(
  '/api/assessments',
  asyncHandler(async (request, response) => {
    const input = assessmentCreateSchema.parse(request.body)
    const assessment = await prisma.bodyAssessment.create({
      data: {
        userId: currentUser(request).id,
        ...input,
      },
    })

    response.status(201).json({ assessment })
  }),
)

app.put(
  '/api/assessments/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const input = assessmentUpdateSchema.parse(request.body)
    const existing = await prisma.bodyAssessment.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'ASSESSMENT_NOT_FOUND')
    }

    const assessment = await prisma.bodyAssessment.update({ where: { id }, data: input })
    response.json({ assessment })
  }),
)

app.delete(
  '/api/assessments/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamSchema.parse(request.params)
    const existing = await prisma.bodyAssessment.findFirst({ where: { id, userId: currentUser(request).id } })

    if (!existing) {
      throw new HttpError(404, 'ASSESSMENT_NOT_FOUND')
    }

    await prisma.bodyAssessment.delete({ where: { id } })
    response.status(204).send()
  }),
)

app.get(
  '/api/dashboard',
  asyncHandler(async (request, response) => {
    const userId = currentUser(request).id
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [user, workouts, runs, assessments] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.workout.findMany({
        where: { userId },
        include: { exercises: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.run.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
      }),
      prisma.bodyAssessment.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      }),
    ])

    const workoutVolume = workouts.reduce(
      (total, workout) =>
        total +
        workout.exercises.reduce(
          (exerciseTotal, exercise) => exerciseTotal + exercise.sets * parseReps(exercise.reps) * exercise.load,
          0,
        ),
      0,
    )
    const weeklyKm = runs.reduce((sum, run) => sum + run.distance, 0)
    const averagePaceSeconds =
      runs.reduce((sum, run) => sum + run.paceSeconds * run.distance, 0) / Math.max(weeklyKm, 1)
    const latestAssessment = assessments.at(-1)
    const firstAssessment = assessments[0]

    response.json({
      metrics: {
        workoutVolume,
        weeklyKm,
        averagePaceSeconds: Math.round(averagePaceSeconds) || 0,
        bestPaceSeconds: runs.length ? Math.min(...runs.map((run) => run.paceSeconds)) : 0,
        recoveryScore: calculateRecoveryScore({
          sleep: user.sleep,
          fatigue: user.fatigue,
          soreness: user.soreness,
          workoutVolume,
          runs,
        }),
        weight: latestAssessment?.weight ?? user.weight,
        vo2: latestAssessment?.vo2 ?? null,
        restingHr: latestAssessment?.restingHr ?? null,
        bodyFatDelta:
          latestAssessment && firstAssessment ? latestAssessment.bodyFat - firstAssessment.bodyFat : null,
      },
      recentRuns: runs,
      workouts,
    })
  }),
)

app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`EvoPace API listening on http://localhost:${env.port}`)
})
