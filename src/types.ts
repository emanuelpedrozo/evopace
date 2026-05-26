import type { Activity, BarChart3 } from 'lucide-react'

export type ModuleId =
  | 'dashboard'
  | 'cadastro'
  | 'avaliacao'
  | 'musculacao'
  | 'corrida'
  | 'hibrido'
  | 'periodizacao'
  | 'social'
  | 'admin'

export type UserRole = 'Aluno' | 'Personal Trainer' | 'Administrador'
export type Goal =
  | 'emagrecimento'
  | 'hipertrofia'
  | 'performance'
  | 'corrida 5km'
  | 'corrida 10km'
  | 'meia maratona'
  | 'maratona'
  | 'recomposição corporal'
export type Level = 'iniciante' | 'intermediário' | 'avançado'
export type Sex = 'feminino' | 'masculino' | 'outro'
export type SplitType = 'ABC' | 'ABCD' | 'Full body' | 'Upper/lower' | 'Push/Pull/Legs'
export type RunType =
  | 'regenerativo'
  | 'intervalado'
  | 'tiro'
  | 'longo'
  | 'tempo run'
  | 'fartlek'
  | 'subida'
  | 'progressivo'

export type Profile = {
  name: string
  email: string
  age: number
  weight: number
  height: number
  sex: Sex
  goal: Goal
  level: Level
  role: UserRole
  restrictions: string
  experience: string
  sleep: number
  fatigue: number
  soreness: number
}

export type Exercise = {
  id: string
  name: string
  target: string
  secondary: string
  equipment: string
  difficulty: Level
  instruction: string
  video: string
}

export type WorkoutExercise = Exercise & {
  sets: number
  reps: string
  load: number
  rest: number
  rpe: number
}

export type WorkoutDay = {
  id: string
  name: string
  split: SplitType
  focus: string
  exercises: WorkoutExercise[]
}

export type RunEntry = {
  id: string
  date: string
  type: RunType
  distance: number
  time: number
  pace: string
  elevation: number
  avgHr: number
  maxHr: number
  cadence: number
  effort: number
}

export type Assessment = {
  id: string
  date: string
  weight: number
  bodyFat: number
  muscleMass: number
  waist: number
  chest: number
  thigh: number
  vo2: number
  restingHr: number
}

export type Metrics = {
  workoutVolume: number
  weeklyKm: number
  recovery: number
  avgPace: string
  bestPace: string
  bodyFatDelta: number
  weight: number
  vo2: number
  restingHr: number
}

export type ApiUser = {
  id: string
  name: string
  email: string
  age: number
  weight: number
  height: number
  sex: Sex
  goal: Goal
  level: Level
  role: UserRole
  restrictions: string | null
  experience: string | null
  sleep: number
  fatigue: number
  soreness: number
}

export type ApiWorkout = {
  id: string
  trainingPlanId?: string | null
  planDayCode?: string | null
  planDayName?: string | null
  name: string
  split: SplitType
  focus: string
  exercises: {
    id: string
    name: string
    video: string | null
    instruction: string
    targetMuscle: string
    secondaryMuscles: string | null
    equipment: string
    difficulty: Level
    sets: number
    reps: string
    load: number
    restSeconds: number
    rpe: number
  }[]
}

export type ApiWorkoutPlan = {
  id: string
  name: string
  split: SplitType
  goal: string
  startDate: string
  endDate: string | null
  status: string
  workouts: ApiWorkout[]
}

export type ApiRun = {
  id: string
  date: string
  type: RunType
  distance: number
  timeMinutes: number
  paceSeconds: number
  elevation: number
  avgHr: number
  maxHr: number
  cadence: number
  effort: number
}

export type ApiAssessment = {
  id: string
  date: string
  weight: number
  bodyFat: number
  muscleMass: number
  waist: number
  chest: number
  thigh: number
  vo2: number
  restingHr: number
}

export type DashboardResponse = {
  metrics: {
    workoutVolume: number
    weeklyKm: number
    averagePaceSeconds: number
    bestPaceSeconds: number
    recoveryScore: number
    weight: number
    vo2: number | null
    restingHr: number | null
    bodyFatDelta: number | null
  }
  recentRuns: ApiRun[]
  workouts: ApiWorkout[]
}

export type ApiSetExecution = {
  id: string
  exerciseId: string
  setNumber: number
  reps: number
  load: number
  rpe: number
  rir: number | null
  failed: boolean
  completed: boolean
}

export type ApiWorkoutExecution = {
  id: string
  workoutId: string
  startedAt: string
  finishedAt: string | null
  notes: string | null
  setExecutions: ApiSetExecution[]
  workout?: ApiWorkout
}

export type NavigationItem = {
  id: ModuleId
  label: string
  icon: typeof BarChart3
}

export type StatIcon = typeof Activity
