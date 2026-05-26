import { z } from 'zod'

export const goals = [
  'emagrecimento',
  'hipertrofia',
  'performance',
  'corrida 5km',
  'corrida 10km',
  'meia maratona',
  'maratona',
  'recomposição corporal',
] as const

export const levels = ['iniciante', 'intermediário', 'avançado'] as const
export const roles = ['Aluno', 'Personal Trainer', 'Administrador'] as const
export const sexes = ['feminino', 'masculino', 'outro'] as const
export const runTypes = [
  'regenerativo',
  'intervalado',
  'tiro',
  'longo',
  'tempo run',
  'fartlek',
  'subida',
  'progressivo',
] as const
export const splitTypes = ['ABC', 'ABCD', 'Full body', 'Upper/lower', 'Push/Pull/Legs'] as const

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(12).max(100),
  weight: z.number().min(30).max(300),
  height: z.number().int().min(120).max(230),
  sex: z.enum(sexes),
  goal: z.enum(goals),
  level: z.enum(levels),
  role: z.enum(roles).default('Aluno'),
  restrictions: z.string().max(1000).optional(),
  experience: z.string().max(1000).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const profileUpdateSchema = registerSchema
  .omit({ password: true, email: true })
  .partial()
  .extend({
    sleep: z.number().min(0).max(12).optional(),
    fatigue: z.number().int().min(1).max(10).optional(),
    soreness: z.number().int().min(1).max(10).optional(),
  })

export const workoutExerciseSchema = z.object({
  name: z.string().min(2),
  video: z.string().max(400).optional(),
  instruction: z.string().min(5),
  targetMuscle: z.string().min(2),
  secondaryMuscles: z.string().optional(),
  equipment: z.string().min(2),
  difficulty: z.enum(levels),
  sets: z.number().int().min(1).max(12),
  reps: z.string().min(1),
  load: z.number().min(0),
  restSeconds: z.number().int().min(0).max(600),
  rpe: z.number().int().min(1).max(10),
  order: z.number().int().min(0).optional(),
})

export const workoutCreateSchema = z.object({
  name: z.string().min(2),
  split: z.enum(splitTypes),
  focus: z.string().min(2),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).min(1),
})

export const workoutUpdateSchema = workoutCreateSchema.partial().extend({
  exercises: z.array(workoutExerciseSchema).min(1).optional(),
})

export const workoutPlanDaySchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(2),
  focus: z.string().min(2),
  exercises: z.array(workoutExerciseSchema).min(1),
})

export const workoutPlanCreateSchema = z
  .object({
    name: z.string().min(2),
    split: z.enum(splitTypes),
    goal: z.string().min(2),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    days: z.array(workoutPlanDaySchema).min(1),
  })
  .refine((input) => !input.endDate || input.endDate >= input.startDate, {
    message: 'END_DATE_BEFORE_START_DATE',
    path: ['endDate'],
  })

export const setExecutionSchema = z.object({
  exerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0),
  load: z.number().min(0),
  rpe: z.number().int().min(1).max(10),
  rir: z.number().int().min(0).max(10).optional(),
  failed: z.boolean().default(false),
  completed: z.boolean().default(true),
})

export const workoutExecutionSchema = z.object({
  finishedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  sets: z.array(setExecutionSchema).min(1),
})

export const runCreateSchema = z.object({
  date: z.coerce.date().optional(),
  type: z.enum(runTypes),
  distance: z.number().positive(),
  timeMinutes: z.number().positive(),
  elevation: z.number().min(0).default(0),
  avgHr: z.number().int().min(40).max(230),
  maxHr: z.number().int().min(40).max(240),
  cadence: z.number().int().min(80).max(240),
  effort: z.number().int().min(1).max(10),
  notes: z.string().optional(),
})

export const runUpdateSchema = runCreateSchema.partial()

export const assessmentCreateSchema = z.object({
  date: z.coerce.date().optional(),
  weight: z.number().min(30).max(300),
  bodyFat: z.number().min(2).max(70),
  muscleMass: z.number().min(10).max(200),
  waist: z.number().min(30).max(250),
  chest: z.number().min(30).max(250),
  thigh: z.number().min(20).max(150),
  vo2: z.number().min(10).max(90),
  restingHr: z.number().int().min(30).max(130),
  photoFront: z.string().optional(),
  photoSide: z.string().optional(),
})

export const assessmentUpdateSchema = assessmentCreateSchema.partial()
