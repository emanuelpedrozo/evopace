import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Award,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Gauge,
  HeartPulse,
  LineChart,
  Loader2,
  Lock,
  Medal,
  Moon,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import './App.css'

type ModuleId =
  | 'dashboard'
  | 'cadastro'
  | 'avaliacao'
  | 'musculacao'
  | 'corrida'
  | 'hibrido'
  | 'periodizacao'
  | 'social'
  | 'admin'

type UserRole = 'Aluno' | 'Personal Trainer' | 'Administrador'
type Goal =
  | 'emagrecimento'
  | 'hipertrofia'
  | 'performance'
  | 'corrida 5km'
  | 'corrida 10km'
  | 'meia maratona'
  | 'maratona'
  | 'recomposição corporal'
type Level = 'iniciante' | 'intermediário' | 'avançado'
type Sex = 'feminino' | 'masculino' | 'outro'
type SplitType = 'ABC' | 'ABCD' | 'Full body' | 'Upper/lower' | 'Push/Pull/Legs'
type RunType =
  | 'regenerativo'
  | 'intervalado'
  | 'tiro'
  | 'longo'
  | 'tempo run'
  | 'fartlek'
  | 'subida'
  | 'progressivo'

type Profile = {
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

type Exercise = {
  id: string
  name: string
  target: string
  secondary: string
  equipment: string
  difficulty: Level
  instruction: string
  video: string
}

type WorkoutExercise = Exercise & {
  sets: number
  reps: string
  load: number
  rest: number
  rpe: number
}

type WorkoutDay = {
  id: string
  name: string
  split: SplitType
  focus: string
  exercises: WorkoutExercise[]
}

type RunEntry = {
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

type Assessment = {
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

type Metrics = {
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

type ApiUser = {
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

type ApiWorkout = {
  id: string
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

type ApiRun = {
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

type ApiAssessment = {
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

type DashboardResponse = {
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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3334/api'
const TOKEN_KEY = 'evopace.token'

const goals: Goal[] = [
  'emagrecimento',
  'hipertrofia',
  'performance',
  'corrida 5km',
  'corrida 10km',
  'meia maratona',
  'maratona',
  'recomposição corporal',
]

const levels: Level[] = ['iniciante', 'intermediário', 'avançado']
const roles: UserRole[] = ['Aluno', 'Personal Trainer', 'Administrador']
const sexes: Sex[] = ['feminino', 'masculino', 'outro']
const runTypes: RunType[] = [
  'regenerativo',
  'intervalado',
  'tiro',
  'longo',
  'tempo run',
  'fartlek',
  'subida',
  'progressivo',
]

const exerciseLibrary: Exercise[] = [
  {
    id: 'squat',
    name: 'Agachamento livre',
    target: 'Quadríceps',
    secondary: 'Glúteos, core',
    equipment: 'Barra',
    difficulty: 'intermediário',
    instruction: 'Desça mantendo coluna neutra, joelhos alinhados e controle total do tronco.',
    video: 'biblioteca/agachamento-livre',
  },
  {
    id: 'rdl',
    name: 'Levantamento terra romeno',
    target: 'Posterior de coxa',
    secondary: 'Glúteos, lombar',
    equipment: 'Barra ou halteres',
    difficulty: 'intermediário',
    instruction: 'Projete o quadril para trás e mantenha a barra próxima ao corpo.',
    video: 'biblioteca/terra-romeno',
  },
  {
    id: 'bench',
    name: 'Supino reto',
    target: 'Peitoral',
    secondary: 'Tríceps, deltóide anterior',
    equipment: 'Banco e barra',
    difficulty: 'iniciante',
    instruction: 'Controle a descida, estabilize escápulas e empurre sem perder a linha do punho.',
    video: 'biblioteca/supino-reto',
  },
  {
    id: 'row',
    name: 'Remada curvada',
    target: 'Costas',
    secondary: 'Bíceps, posterior de ombro',
    equipment: 'Barra',
    difficulty: 'intermediário',
    instruction: 'Incline o tronco com coluna neutra e puxe os cotovelos para trás.',
    video: 'biblioteca/remada-curvada',
  },
  {
    id: 'lunge',
    name: 'Afundo caminhando',
    target: 'Glúteos',
    secondary: 'Quadríceps, core',
    equipment: 'Halteres',
    difficulty: 'iniciante',
    instruction: 'Dê passos controlados e mantenha o joelho da frente alinhado ao pé.',
    video: 'biblioteca/afundo',
  },
  {
    id: 'press',
    name: 'Desenvolvimento militar',
    target: 'Ombros',
    secondary: 'Tríceps, core',
    equipment: 'Barra',
    difficulty: 'intermediário',
    instruction: 'Pressione acima da cabeça sem hiperestender a lombar.',
    video: 'biblioteca/desenvolvimento',
  },
]

const initialProfile: Profile = {
  name: 'Marina Costa',
  email: 'marina@evopace.app',
  age: 32,
  weight: 68,
  height: 169,
  sex: 'feminino',
  goal: 'meia maratona',
  level: 'intermediário',
  role: 'Aluno',
  restrictions: 'Histórico leve de dor patelar em semanas de alto volume.',
  experience: '2 anos de musculação, 18 meses de corrida consistente.',
  sleep: 7,
  fatigue: 4,
  soreness: 5,
}

const initialWorkouts: WorkoutDay[] = [
  {
    id: 'lower-a',
    name: 'Lower A',
    split: 'Upper/lower',
    focus: 'Pernas pesado',
    exercises: [
      { ...exerciseLibrary[0], sets: 4, reps: '5-6', load: 72, rest: 150, rpe: 8 },
      { ...exerciseLibrary[1], sets: 3, reps: '8', load: 64, rest: 120, rpe: 8 },
      { ...exerciseLibrary[4], sets: 3, reps: '10/cada', load: 18, rest: 90, rpe: 7 },
    ],
  },
  {
    id: 'upper-a',
    name: 'Upper A',
    split: 'Upper/lower',
    focus: 'Força superior',
    exercises: [
      { ...exerciseLibrary[2], sets: 4, reps: '6-8', load: 48, rest: 120, rpe: 8 },
      { ...exerciseLibrary[3], sets: 4, reps: '8', load: 52, rest: 120, rpe: 8 },
      { ...exerciseLibrary[5], sets: 3, reps: '8-10', load: 28, rest: 90, rpe: 7 },
    ],
  },
]

const initialRuns: RunEntry[] = [
  {
    id: 'run-1',
    date: '2026-05-20',
    type: 'regenerativo',
    distance: 6,
    time: 39,
    pace: '6:30',
    elevation: 42,
    avgHr: 139,
    maxHr: 154,
    cadence: 166,
    effort: 4,
  },
  {
    id: 'run-2',
    date: '2026-05-22',
    type: 'intervalado',
    distance: 8,
    time: 43,
    pace: '5:22',
    elevation: 58,
    avgHr: 162,
    maxHr: 181,
    cadence: 176,
    effort: 8,
  },
  {
    id: 'run-3',
    date: '2026-05-25',
    type: 'longo',
    distance: 14,
    time: 88,
    pace: '6:17',
    elevation: 112,
    avgHr: 151,
    maxHr: 169,
    cadence: 170,
    effort: 7,
  },
]

const initialAssessments: Assessment[] = [
  {
    id: 'assess-1',
    date: '2026-03-01',
    weight: 70.4,
    bodyFat: 24.6,
    muscleMass: 48.2,
    waist: 78,
    chest: 91,
    thigh: 57,
    vo2: 42,
    restingHr: 61,
  },
  {
    id: 'assess-2',
    date: '2026-04-10',
    weight: 69.1,
    bodyFat: 23.1,
    muscleMass: 48.8,
    waist: 76,
    chest: 92,
    thigh: 57.5,
    vo2: 44,
    restingHr: 58,
  },
  {
    id: 'assess-3',
    date: '2026-05-24',
    weight: 68,
    bodyFat: 21.8,
    muscleMass: 49.5,
    waist: 74.5,
    chest: 92.5,
    thigh: 58,
    vo2: 46,
    restingHr: 56,
  },
]

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'cadastro', label: 'Cadastro', icon: Users },
  { id: 'avaliacao', label: 'Avaliação', icon: HeartPulse },
  { id: 'musculacao', label: 'Musculação', icon: Dumbbell },
  { id: 'corrida', label: 'Corrida', icon: Route },
  { id: 'hibrido', label: 'Híbrido', icon: Zap },
  { id: 'periodizacao', label: 'Periodização', icon: CalendarDays },
  { id: 'social', label: 'Social', icon: Medal },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
] satisfies { id: ModuleId; label: string; icon: typeof BarChart3 }[]

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function paceToSeconds(pace: string) {
  const [minutes, seconds] = pace.split(':').map(Number)
  return minutes * 60 + seconds
}

function secondsToPace(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

async function apiRequest<T>(path: string, options: RequestInit & { token?: string } = {}) {
  const { token, headers, ...requestOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP_${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}

function toProfile(user: ApiUser): Profile {
  return {
    name: user.name,
    email: user.email,
    age: user.age,
    weight: user.weight,
    height: user.height,
    sex: user.sex,
    goal: user.goal,
    level: user.level,
    role: user.role,
    restrictions: user.restrictions ?? '',
    experience: user.experience ?? '',
    sleep: user.sleep,
    fatigue: user.fatigue,
    soreness: user.soreness,
  }
}

function toWorkout(workout: ApiWorkout): WorkoutDay {
  return {
    id: workout.id,
    name: workout.name,
    split: workout.split,
    focus: workout.focus,
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      target: exercise.targetMuscle,
      secondary: exercise.secondaryMuscles ?? '',
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instruction: exercise.instruction,
      video: exercise.video ?? '',
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      rest: exercise.restSeconds,
      rpe: exercise.rpe,
    })),
  }
}

function toRun(run: ApiRun): RunEntry {
  return {
    id: run.id,
    date: run.date.slice(0, 10),
    type: run.type,
    distance: run.distance,
    time: run.timeMinutes,
    pace: secondsToPace(run.paceSeconds),
    elevation: run.elevation,
    avgHr: run.avgHr,
    maxHr: run.maxHr,
    cadence: run.cadence,
    effort: run.effort,
  }
}

function toAssessment(assessment: ApiAssessment): Assessment {
  return {
    id: assessment.id,
    date: assessment.date.slice(0, 10),
    weight: assessment.weight,
    bodyFat: assessment.bodyFat,
    muscleMass: assessment.muscleMass,
    waist: assessment.waist,
    chest: assessment.chest,
    thigh: assessment.thigh,
    vo2: assessment.vo2,
    restingHr: assessment.restingHr,
  }
}

function toMetrics(response: DashboardResponse): Metrics {
  return {
    workoutVolume: response.metrics.workoutVolume,
    weeklyKm: response.metrics.weeklyKm,
    recovery: response.metrics.recoveryScore,
    avgPace: secondsToPace(response.metrics.averagePaceSeconds),
    bestPace: secondsToPace(response.metrics.bestPaceSeconds),
    bodyFatDelta: response.metrics.bodyFatDelta ?? 0,
    weight: response.metrics.weight,
    vo2: response.metrics.vo2 ?? 0,
    restingHr: response.metrics.restingHr ?? 0,
  }
}

function toWorkoutPayload(workout: WorkoutDay) {
  return {
    name: workout.name,
    split: workout.split,
    focus: workout.focus,
    exercises: workout.exercises.map((exercise, index) => ({
      name: exercise.name,
      video: exercise.video,
      instruction: exercise.instruction,
      targetMuscle: exercise.target,
      secondaryMuscles: exercise.secondary,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      restSeconds: exercise.rest,
      rpe: exercise.rpe,
      order: index,
    })),
  }
}

function parseReps(reps: string) {
  return Number.parseInt(reps, 10) || 0
}

function getWorkoutVolume(workouts: WorkoutDay[]) {
  return workouts.reduce(
    (total, workout) =>
      total +
      workout.exercises.reduce((exerciseTotal, exercise) => {
        const reps = Number.parseInt(exercise.reps, 10) || 8
        return exerciseTotal + exercise.sets * reps * exercise.load
      }, 0),
    0,
  )
}

function getWeeklyKm(runs: RunEntry[]) {
  return runs.reduce((sum, run) => sum + run.distance, 0)
}

function getAveragePace(runs: RunEntry[]) {
  const weightedSeconds =
    runs.reduce((sum, run) => sum + paceToSeconds(run.pace) * run.distance, 0) /
    Math.max(getWeeklyKm(runs), 1)
  return secondsToPace(weightedSeconds)
}

function getRecoveryScore(profile: Profile, runs: RunEntry[], workouts: WorkoutDay[]) {
  const hardRunLoad = runs.filter((run) => run.effort >= 7).length * 8
  const longRunLoad = runs.some((run) => run.type === 'longo') ? 10 : 0
  const strengthLoad = Math.min(getWorkoutVolume(workouts) / 900, 18)
  const sleepBonus = Math.max(0, profile.sleep - 6) * 6
  const fatiguePenalty = profile.fatigue * 5
  const sorenessPenalty = profile.soreness * 4
  const raw = 78 + sleepBonus - hardRunLoad - longRunLoad - strengthLoad - fatiguePenalty - sorenessPenalty

  return Math.max(18, Math.min(96, Math.round(raw)))
}

function getHybridRecommendations(profile: Profile, runs: RunEntry[], workouts: WorkoutDay[]) {
  const recovery = getRecoveryScore(profile, runs, workouts)
  const hasLongRun = runs.some((run) => run.type === 'longo' && run.effort >= 6)
  const hasLegWorkout = workouts.some((workout) => workout.focus.toLowerCase().includes('pernas'))
  const weeklyKm = getWeeklyKm(runs)
  const suggestions = []

  if (hasLongRun && hasLegWorkout) {
    suggestions.push('Reduzir 20% do volume de pernas nas 24h próximas ao longão.')
  }

  if (recovery < 45) {
    suggestions.push('Trocar treino intenso por regenerativo ou descanso ativo.')
  }

  if (profile.soreness >= 7 || profile.fatigue >= 7) {
    suggestions.push('Aplicar deload: menos carga, menos falha e mais descanso entre séries.')
  }

  if (weeklyKm > 30 && profile.goal.includes('corrida')) {
    suggestions.push('Manter força de posterior e glúteos, evitando tiros no dia seguinte ao lower pesado.')
  }

  if (suggestions.length === 0) {
    suggestions.push('Condição adequada para progressão conservadora de carga ou volume.')
  }

  return suggestions
}

function getProgression(exercise: WorkoutExercise, profile: Profile) {
  if (profile.fatigue >= 7 || profile.soreness >= 7) {
    return 'Manter carga e cortar 1 série se RPE subir acima de 8.'
  }

  if (exercise.rpe <= 7) {
    return `Subir carga para ${formatNumber(exercise.load * 1.025, 1)} kg na próxima sessão.`
  }

  if (exercise.rpe >= 9) {
    return 'Repetir carga atual e priorizar técnica.'
  }

  return 'Manter carga e buscar o topo da faixa de repetições.'
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: typeof Activity
  label: string
  value: string
  detail: string
  tone?: 'neutral' | 'good' | 'warning' | 'danger'
}) {
  return (
    <article className={`stat ${tone}`}>
      <Icon aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: string
  children: React.ReactNode
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {action ? <span>{action}</span> : null}
      </div>
      {children}
    </section>
  )
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="progress-row">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function AuthScreen({
  error,
  onLogin,
  onRegister,
}: {
  error: string
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (input: { name: string; email: string; password: string }) => Promise<void>
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@evopace.app')
  const [password, setPassword] = useState('evopace123')
  const [localError, setLocalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setLocalError('')

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        await onRegister({ name, email, password })
      }
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : 'Falha na autenticação')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span>EP</span>
          <div>
            <strong>EvoPace</strong>
            <small>Performance híbrida</small>
          </div>
        </div>

        <div>
          <span className="eyebrow">Acesso seguro</span>
          <h1>{mode === 'login' ? 'Entrar no painel' : 'Criar conta'}</h1>
          <p>Use sua conta para carregar dashboard, treinos, corridas e avaliações direto do PostgreSQL.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => {
              setMode('register')
              setPassword('')
              setEmail('')
            }}
          >
            Cadastro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              Nome
              <input
                minLength={2}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Senha
            <input
              minLength={mode === 'register' ? 8 : 1}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error || localError ? <div className="auth-error">{localError || error}</div> : null}

          <button className="primary-action auth-submit" disabled={submitting} type="submit">
            {submitting ? <Loader2 aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard')
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'anonymous'>(() =>
    authToken ? 'loading' : 'anonymous',
  )
  const [authError, setAuthError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [savingAction, setSavingAction] = useState('')
  const [apiMetrics, setApiMetrics] = useState<Metrics | null>(null)
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [workouts, setWorkouts] = useState<WorkoutDay[]>(initialWorkouts)
  const [runs, setRuns] = useState<RunEntry[]>(initialRuns)
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments)
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({})
  const [restSeconds, setRestSeconds] = useState(0)
  const [runForm, setRunForm] = useState({
    type: 'regenerativo' as RunType,
    distance: 5,
    time: 32,
    elevation: 35,
    avgHr: 145,
    maxHr: 166,
    cadence: 168,
    effort: 5,
  })
  const [assessmentForm, setAssessmentForm] = useState({
    weight: 67.8,
    bodyFat: 21.5,
    muscleMass: 49.7,
    waist: 74,
    chest: 93,
    thigh: 58.2,
    vo2: 46,
    restingHr: 56,
  })

  async function fetchAuthenticatedData(token: string) {
    const [meResponse, dashboardResponse, runsResponse, assessmentsResponse, workoutsResponse] = await Promise.all([
      apiRequest<{ user: ApiUser }>('/me', { token }),
      apiRequest<DashboardResponse>('/dashboard', { token }),
      apiRequest<{ runs: ApiRun[] }>('/runs', { token }),
      apiRequest<{ assessments: ApiAssessment[] }>('/assessments', { token }),
      apiRequest<{ workouts: ApiWorkout[] }>('/workouts', { token }),
    ])

    return {
      profile: toProfile(meResponse.user),
      metrics: toMetrics(dashboardResponse),
      runs: runsResponse.runs.map(toRun),
      assessments: assessmentsResponse.assessments.map(toAssessment),
      workouts: workoutsResponse.workouts.map(toWorkout),
    }
  }

  async function refreshAuthenticatedData(token = authToken) {
    if (!token) {
      return
    }

    const data = await fetchAuthenticatedData(token)
    setProfile(data.profile)
    setApiMetrics(data.metrics)
    setRuns(data.runs)
    setAssessments(data.assessments)
    setWorkouts(data.workouts)
  }

  useEffect(() => {
    if (!authToken) {
      return
    }

    let canceled = false

    void (async () => {
      try {
        const data = await fetchAuthenticatedData(authToken)

        if (canceled) {
          return
        }

        setProfile(data.profile)
        setApiMetrics(data.metrics)
        setRuns(data.runs)
        setAssessments(data.assessments)
        setWorkouts(data.workouts)

        setAuthStatus('authenticated')
      } catch (error: unknown) {
        if (canceled) {
          return
        }

        window.localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
        setAuthStatus('anonymous')
        setAuthError(error instanceof Error ? error.message : 'Falha ao carregar sessão')
      }
    })()

    return () => {
      canceled = true
    }
  }, [authToken])

  useEffect(() => {
    if (!restSeconds) return

    const timerId = window.setInterval(() => {
      setRestSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [restSeconds])

  const localMetrics = useMemo(() => {
    const workoutVolume = getWorkoutVolume(workouts)
    const weeklyKm = getWeeklyKm(runs)
    const recovery = getRecoveryScore(profile, runs, workouts)
    const avgPace = getAveragePace(runs)
    const bestPace = secondsToPace(Math.min(...runs.map((run) => paceToSeconds(run.pace))))
    const latestAssessment = assessments.at(-1) ?? initialAssessments[0]
    const firstAssessment = assessments[0] ?? initialAssessments[0]

    return {
      workoutVolume,
      weeklyKm,
      recovery,
      avgPace,
      bestPace,
      bodyFatDelta: latestAssessment.bodyFat - firstAssessment.bodyFat,
      weight: latestAssessment.weight,
      vo2: latestAssessment.vo2,
      restingHr: latestAssessment.restingHr,
    }
  }, [assessments, profile, runs, workouts])

  const metrics = apiMetrics ?? localMetrics

  const recommendations = useMemo(
    () => getHybridRecommendations(profile, runs, workouts),
    [profile, runs, workouts],
  )

  const completedCount = Object.values(completedSets).filter(Boolean).length
  const totalSets = workouts.reduce(
    (sum, workout) => sum + workout.exercises.reduce((setSum, exercise) => setSum + exercise.sets, 0),
    0,
  )
  const completion = Math.round((completedCount / totalSets) * 100) || 0

  function updateWorkoutLoad(workoutId: string, exerciseId: string, load: number) {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, load } : exercise,
              ),
            }
          : workout,
      ),
    )
  }

  async function saveProfile() {
    if (!authToken) return

    setSavingAction('profile')
    setActionMessage('')

    try {
      const response = await apiRequest<{ user: ApiUser }>('/profile', {
        method: 'PATCH',
        token: authToken,
        body: JSON.stringify({
          name: profile.name,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          sex: profile.sex,
          goal: profile.goal,
          level: profile.level,
          role: profile.role,
          restrictions: profile.restrictions,
          experience: profile.experience,
          sleep: profile.sleep,
          fatigue: profile.fatigue,
          soreness: profile.soreness,
        }),
      })

      setProfile(toProfile(response.user))
      await refreshAuthenticatedData()
      setActionMessage('Perfil salvo no banco.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao salvar perfil.')
    } finally {
      setSavingAction('')
    }
  }

  async function addRun() {
    if (!authToken) return

    setSavingAction('run')
    setActionMessage('')

    try {
      await apiRequest<{ run: ApiRun }>('/runs', {
        method: 'POST',
        token: authToken,
        body: JSON.stringify({
          type: runForm.type,
          distance: runForm.distance,
          timeMinutes: runForm.time,
          elevation: runForm.elevation,
          avgHr: runForm.avgHr,
          maxHr: runForm.maxHr,
          cadence: runForm.cadence,
          effort: runForm.effort,
        }),
      })
      await refreshAuthenticatedData()
      setActionMessage('Corrida registrada no banco.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao salvar corrida.')
    } finally {
      setSavingAction('')
    }
  }

  async function deleteRun(id: string) {
    if (!authToken) return

    setSavingAction(`run-${id}`)
    setActionMessage('')

    try {
      await apiRequest<null>(`/runs/${id}`, { method: 'DELETE', token: authToken })
      await refreshAuthenticatedData()
      setActionMessage('Corrida removida.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao remover corrida.')
    } finally {
      setSavingAction('')
    }
  }

  async function addAssessment() {
    if (!authToken) return

    setSavingAction('assessment')
    setActionMessage('')

    try {
      await apiRequest<{ assessment: ApiAssessment }>('/assessments', {
        method: 'POST',
        token: authToken,
        body: JSON.stringify(assessmentForm),
      })
      await refreshAuthenticatedData()
      setActionMessage('Avaliação registrada no banco.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao salvar avaliação.')
    } finally {
      setSavingAction('')
    }
  }

  async function deleteAssessment(id: string) {
    if (!authToken) return

    setSavingAction(`assessment-${id}`)
    setActionMessage('')

    try {
      await apiRequest<null>(`/assessments/${id}`, { method: 'DELETE', token: authToken })
      await refreshAuthenticatedData()
      setActionMessage('Avaliação removida.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao remover avaliação.')
    } finally {
      setSavingAction('')
    }
  }

  async function saveWorkout(workout: WorkoutDay) {
    if (!authToken) return

    setSavingAction(`workout-${workout.id}`)
    setActionMessage('')

    try {
      await apiRequest<{ workout: ApiWorkout }>(`/workouts/${workout.id}`, {
        method: 'PUT',
        token: authToken,
        body: JSON.stringify(toWorkoutPayload(workout)),
      })
      await refreshAuthenticatedData()
      setActionMessage('Treino salvo no banco.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao salvar treino.')
    } finally {
      setSavingAction('')
    }
  }

  async function saveWorkoutExecution(workout: WorkoutDay) {
    if (!authToken) return

    const sets = workout.exercises.flatMap((exercise) =>
      Array.from({ length: exercise.sets }, (_, index) => {
        const setKey = `${workout.id}-${exercise.id}-${index}`

        if (!completedSets[setKey]) {
          return null
        }

        return {
          exerciseId: exercise.id,
          setNumber: index + 1,
          reps: parseReps(exercise.reps),
          load: exercise.load,
          rpe: exercise.rpe,
          failed: false,
          completed: true,
        }
      }).filter((set) => set !== null),
    )

    if (!sets.length) {
      setActionMessage('Marque pelo menos uma série concluída para registrar a execução.')
      return
    }

    setSavingAction(`execution-${workout.id}`)
    setActionMessage('')

    try {
      await apiRequest(`/workouts/${workout.id}/executions`, {
        method: 'POST',
        token: authToken,
        body: JSON.stringify({
          finishedAt: new Date().toISOString(),
          sets,
        }),
      })
      setCompletedSets((current) =>
        Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${workout.id}-`))),
      )
      await refreshAuthenticatedData()
      setActionMessage('Execução de treino registrada.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Falha ao registrar execução.')
    } finally {
      setSavingAction('')
    }
  }

  async function handleLogin(email: string, password: string) {
    setAuthError('')
    const response = await apiRequest<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    window.localStorage.setItem(TOKEN_KEY, response.token)
    setProfile(toProfile(response.user))
    setAuthStatus('loading')
    setAuthToken(response.token)
  }

  async function handleRegister(input: { name: string; email: string; password: string }) {
    setAuthError('')
    const response = await apiRequest<{ token: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        age: 30,
        weight: 75,
        height: 175,
        sex: 'outro',
        goal: 'recomposição corporal',
        level: 'iniciante',
        role: 'Aluno',
        restrictions: '',
        experience: '',
      }),
    })

    window.localStorage.setItem(TOKEN_KEY, response.token)
    setProfile(toProfile(response.user))
    setAuthStatus('loading')
    setAuthToken(response.token)
  }

  function handleLogout() {
    window.localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setAuthStatus('anonymous')
    setApiMetrics(null)
  }

  if (authStatus === 'loading') {
    return (
      <div className="auth-shell">
        <div className="loading-state">
          <Loader2 aria-hidden="true" />
          <span>Carregando EvoPace</span>
        </div>
      </div>
    )
  }

  if (authStatus === 'anonymous') {
    return <AuthScreen error={authError} onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>EP</span>
          <div>
            <strong>EvoPace</strong>
            <small>Performance híbrida</small>
          </div>
        </div>

        <nav aria-label="Módulos">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={activeModule === item.id ? 'active' : ''}
                onClick={() => setActiveModule(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Moon aria-hidden="true" />
          <div>
            <strong>{profile.sleep}h sono</strong>
            <span>Fadiga {profile.fatigue}/10</span>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">{profile.role}</span>
            <h1>{navigation.find((item) => item.id === activeModule)?.label}</h1>
          </div>
          <div className="profile-chip">
            <span>{profile.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{profile.name}</strong>
              <small>{profile.goal}</small>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        {actionMessage ? <div className="action-message">{actionMessage}</div> : null}

        {activeModule === 'dashboard' ? (
          <Dashboard
            completion={completion}
            metrics={metrics}
            profile={profile}
            recommendations={recommendations}
            runs={runs}
            workouts={workouts}
          />
        ) : null}

        {activeModule === 'cadastro' ? (
          <Registration
            isSaving={savingAction === 'profile'}
            onSave={saveProfile}
            profile={profile}
            setProfile={setProfile}
          />
        ) : null}

        {activeModule === 'avaliacao' ? (
          <Assessments
            assessmentForm={assessmentForm}
            assessments={assessments}
            isSaving={savingAction === 'assessment'}
            onAdd={addAssessment}
            onDelete={deleteAssessment}
            savingAction={savingAction}
            setAssessmentForm={setAssessmentForm}
          />
        ) : null}

        {activeModule === 'musculacao' ? (
          <Strength
            completedSets={completedSets}
            profile={profile}
            restSeconds={restSeconds}
            setCompletedSets={setCompletedSets}
            setRestSeconds={setRestSeconds}
            onSaveExecution={saveWorkoutExecution}
            onSaveWorkout={saveWorkout}
            savingAction={savingAction}
            updateWorkoutLoad={updateWorkoutLoad}
            workouts={workouts}
          />
        ) : null}

        {activeModule === 'corrida' ? (
          <Running
            metrics={metrics}
            isSaving={savingAction === 'run'}
            onAdd={addRun}
            onDelete={deleteRun}
            runForm={runForm}
            runs={runs}
            savingAction={savingAction}
            setRunForm={setRunForm}
          />
        ) : null}

        {activeModule === 'hibrido' ? (
          <Hybrid metrics={metrics} profile={profile} recommendations={recommendations} />
        ) : null}

        {activeModule === 'periodizacao' ? <Periodization /> : null}

        {activeModule === 'social' ? <Social /> : null}

        {activeModule === 'admin' ? <Admin /> : null}
      </main>
    </div>
  )
}

function Dashboard({
  completion,
  metrics,
  profile,
  recommendations,
  runs,
  workouts,
}: {
  completion: number
  metrics: Metrics
  profile: Profile
  recommendations: string[]
  runs: RunEntry[]
  workouts: WorkoutDay[]
}) {
  const recoveryTone = metrics.recovery >= 70 ? 'good' : metrics.recovery >= 45 ? 'warning' : 'danger'

  return (
    <div className="module-grid">
      <section className="stats-grid">
        <Stat
          detail={`${workouts.length} treinos ativos`}
          icon={Dumbbell}
          label="Volume semanal"
          value={`${formatNumber(metrics.workoutVolume)} kg`}
        />
        <Stat
          detail={`${runs.length} registros recentes`}
          icon={Route}
          label="Corrida"
          value={`${formatNumber(metrics.weeklyKm, 1)} km`}
        />
        <Stat
          detail="Algoritmo de fadiga"
          icon={HeartPulse}
          label="Recovery score"
          tone={recoveryTone}
          value={`${metrics.recovery}%`}
        />
        <Stat detail="Séries concluídas" icon={Check} label="Aderência" tone="good" value={`${completion}%`} />
      </section>

      <Panel title="Visão da Semana" action="MVP operacional">
        <div className="split-layout">
          <div className="timeline">
            {[
              ['Seg', 'Lower A', 'Pernas pesado', 'strength'],
              ['Ter', 'Regenerativo', '6 km Z2', 'run'],
              ['Qua', 'Upper A', 'Força superior', 'strength'],
              ['Qui', 'Intervalado', '6 x 600 m', 'run'],
              ['Sex', 'Mobilidade', 'Recuperação', 'recovery'],
              ['Sáb', 'Longão', '14 km controlado', 'run'],
              ['Dom', 'Descanso', 'Sono e hidratação', 'recovery'],
            ].map(([day, title, detail, type]) => (
              <article className={`timeline-item ${type}`} key={day}>
                <span>{day}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              </article>
            ))}
          </div>
          <div className="insight-list">
            <ProgressBar label="Consistência" value={82} />
            <ProgressBar label="Recuperação" value={metrics.recovery} />
            <ProgressBar label="Meta semanal" value={Math.min(100, Math.round((metrics.weeklyKm / 32) * 100))} />
            {recommendations.map((item) => (
              <div className="ai-note" key={item}>
                <Sparkles aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Indicadores Analíticos">
        <div className="analytics-grid">
          <div className="metric-line">
            <LineChart aria-hidden="true" />
            <span>Pace médio</span>
            <strong>{metrics.avgPace}/km</strong>
          </div>
          <div className="metric-line">
            <Gauge aria-hidden="true" />
            <span>Melhor pace</span>
            <strong>{metrics.bestPace}/km</strong>
          </div>
          <div className="metric-line">
            <TrendingUp aria-hidden="true" />
            <span>VO2 estimado</span>
            <strong>{metrics.vo2}</strong>
          </div>
          <div className="metric-line">
            <Activity aria-hidden="true" />
            <span>FC repouso</span>
            <strong>{metrics.restingHr} bpm</strong>
          </div>
        </div>
      </Panel>

      <Panel title="Perfil Ativo">
        <div className="profile-summary">
          <div>
            <span>Objetivo</span>
            <strong>{profile.goal}</strong>
          </div>
          <div>
            <span>Nível</span>
            <strong>{profile.level}</strong>
          </div>
          <div>
            <span>Peso</span>
            <strong>{metrics.weight} kg</strong>
          </div>
          <div>
            <span>Gordura</span>
            <strong>{formatNumber(metrics.bodyFatDelta, 1)} p.p.</strong>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Registration({
  isSaving,
  onSave,
  profile,
  setProfile,
}: {
  isSaving: boolean
  onSave: () => Promise<void>
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}) {
  return (
    <div className="module-grid">
      <Panel title="Cadastro de Usuário" action="LGPD ready">
        <form className="form-grid">
          <label>
            Nome
            <input
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Idade
            <input
              min="12"
              type="number"
              value={profile.age}
              onChange={(event) => setProfile((current) => ({ ...current, age: Number(event.target.value) }))}
            />
          </label>
          <label>
            Peso
            <input
              min="30"
              step="0.1"
              type="number"
              value={profile.weight}
              onChange={(event) => setProfile((current) => ({ ...current, weight: Number(event.target.value) }))}
            />
          </label>
          <label>
            Altura
            <input
              min="120"
              type="number"
              value={profile.height}
              onChange={(event) => setProfile((current) => ({ ...current, height: Number(event.target.value) }))}
            />
          </label>
          <label>
            Sexo
            <select
              value={profile.sex}
              onChange={(event) => setProfile((current) => ({ ...current, sex: event.target.value as Sex }))}
            >
              {sexes.map((sex) => (
                <option key={sex}>{sex}</option>
              ))}
            </select>
          </label>
          <label>
            Objetivo
            <select
              value={profile.goal}
              onChange={(event) => setProfile((current) => ({ ...current, goal: event.target.value as Goal }))}
            >
              {goals.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>
          </label>
          <label>
            Nível
            <select
              value={profile.level}
              onChange={(event) => setProfile((current) => ({ ...current, level: event.target.value as Level }))}
            >
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label>
            Perfil
            <select
              value={profile.role}
              onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value as UserRole }))}
            >
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            Restrições
            <textarea
              value={profile.restrictions}
              onChange={(event) => setProfile((current) => ({ ...current, restrictions: event.target.value }))}
            />
          </label>
          <label className="wide">
            Experiência
            <textarea
              value={profile.experience}
              onChange={(event) => setProfile((current) => ({ ...current, experience: event.target.value }))}
            />
          </label>
        </form>
        <button className="primary-action" disabled={isSaving} type="button" onClick={onSave}>
          {isSaving ? <Loader2 aria-hidden="true" /> : <Check aria-hidden="true" />}
          Salvar perfil
        </button>
      </Panel>

      <Panel title="Prontidão Diária">
        <div className="slider-stack">
          <label>
            Sono: {profile.sleep}h
            <input
              max="10"
              min="3"
              step="0.5"
              type="range"
              value={profile.sleep}
              onChange={(event) => setProfile((current) => ({ ...current, sleep: Number(event.target.value) }))}
            />
          </label>
          <label>
            Fadiga: {profile.fatigue}/10
            <input
              max="10"
              min="1"
              type="range"
              value={profile.fatigue}
              onChange={(event) => setProfile((current) => ({ ...current, fatigue: Number(event.target.value) }))}
            />
          </label>
          <label>
            Dor muscular: {profile.soreness}/10
            <input
              max="10"
              min="1"
              type="range"
              value={profile.soreness}
              onChange={(event) => setProfile((current) => ({ ...current, soreness: Number(event.target.value) }))}
            />
          </label>
        </div>
      </Panel>
    </div>
  )
}

function Assessments({
  assessmentForm,
  assessments,
  isSaving,
  onAdd,
  onDelete,
  savingAction,
  setAssessmentForm,
}: {
  assessmentForm: {
    weight: number
    bodyFat: number
    muscleMass: number
    waist: number
    chest: number
    thigh: number
    vo2: number
    restingHr: number
  }
  assessments: Assessment[]
  isSaving: boolean
  onAdd: () => Promise<void>
  onDelete: (id: string) => Promise<void>
  savingAction: string
  setAssessmentForm: React.Dispatch<React.SetStateAction<typeof assessmentForm>>
}) {
  return (
    <div className="module-grid">
      <Panel title="Avaliação Física" action={`${assessments.length} registros`}>
        <form className="form-grid compact">
          {[
            ['weight', 'Peso', 'kg'],
            ['bodyFat', 'Gordura', '%'],
            ['muscleMass', 'Massa muscular', 'kg'],
            ['waist', 'Cintura', 'cm'],
            ['chest', 'Tórax', 'cm'],
            ['thigh', 'Coxa', 'cm'],
            ['vo2', 'VO2 estimado', ''],
            ['restingHr', 'FC repouso', 'bpm'],
          ].map(([field, label, suffix]) => (
            <label key={field}>
              {label}
              <span className="input-with-suffix">
                <input
                  step="0.1"
                  type="number"
                  value={assessmentForm[field as keyof typeof assessmentForm]}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      [field]: Number(event.target.value),
                    }))
                  }
                />
                <small>{suffix}</small>
              </span>
            </label>
          ))}
        </form>
        <button className="primary-action" disabled={isSaving} type="button" onClick={onAdd}>
          {isSaving ? <Loader2 aria-hidden="true" /> : <Plus aria-hidden="true" />}
          Registrar avaliação
        </button>
      </Panel>

      <Panel title="Linha do Tempo">
        <div className="assessment-list">
          {assessments.map((assessment) => (
            <article key={assessment.id}>
              <span>{new Date(`${assessment.date}T00:00:00`).toLocaleDateString('pt-BR')}</span>
              <strong>{assessment.weight} kg</strong>
              <small>
                {assessment.bodyFat}% gordura · VO2 {assessment.vo2} · FC {assessment.restingHr}
              </small>
              <button
                className="danger-action"
                disabled={savingAction === `assessment-${assessment.id}`}
                type="button"
                onClick={() => void onDelete(assessment.id)}
              >
                Excluir
              </button>
              <div className="mini-bars">
                <i style={{ height: `${assessment.muscleMass * 1.6}px` }} />
                <i style={{ height: `${assessment.vo2 * 1.5}px` }} />
                <i style={{ height: `${100 - assessment.bodyFat * 2}px` }} />
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Comparação de Fotos">
        <div className="photo-compare">
          <div>
            <span>Antes</span>
          </div>
          <div>
            <span>Atual</span>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Strength({
  completedSets,
  onSaveExecution,
  onSaveWorkout,
  profile,
  restSeconds,
  savingAction,
  setCompletedSets,
  setRestSeconds,
  updateWorkoutLoad,
  workouts,
}: {
  completedSets: Record<string, boolean>
  onSaveExecution: (workout: WorkoutDay) => Promise<void>
  onSaveWorkout: (workout: WorkoutDay) => Promise<void>
  profile: Profile
  restSeconds: number
  savingAction: string
  setCompletedSets: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setRestSeconds: React.Dispatch<React.SetStateAction<number>>
  updateWorkoutLoad: (workoutId: string, exerciseId: string, load: number) => void
  workouts: WorkoutDay[]
}) {
  return (
    <div className="module-grid">
      <Panel title="Execução de Treino" action={restSeconds ? `${restSeconds}s descanso` : 'Pronto'}>
        <div className="workout-stack">
          {workouts.map((workout) => (
            <article className="workout-block" key={workout.id}>
              <div className="workout-heading">
                <div>
                  <span>{workout.split}</span>
                  <strong>{workout.name}</strong>
                  <small>{workout.focus}</small>
                </div>
                <Timer aria-hidden="true" />
              </div>

              {workout.exercises.map((exercise) => (
                <div className="exercise-row" key={exercise.id}>
                  <div className="exercise-main">
                    <strong>{exercise.name}</strong>
                    <span>
                      {exercise.target} · {exercise.equipment} · RPE {exercise.rpe}
                    </span>
                    <small>{exercise.instruction}</small>
                  </div>
                  <label className="load-input">
                    Carga
                    <input
                      type="number"
                      value={exercise.load}
                      onChange={(event) => updateWorkoutLoad(workout.id, exercise.id, Number(event.target.value))}
                    />
                  </label>
                  <div className="set-buttons" aria-label={`Séries de ${exercise.name}`}>
                    {Array.from({ length: exercise.sets }, (_, index) => {
                      const setKey = `${workout.id}-${exercise.id}-${index}`
                      const done = completedSets[setKey]
                      return (
                        <button
                          key={setKey}
                          className={done ? 'done' : ''}
                          type="button"
                          title={`Série ${index + 1}`}
                          onClick={() => {
                            setCompletedSets((current) => ({ ...current, [setKey]: !current[setKey] }))
                            setRestSeconds(exercise.rest)
                          }}
                        >
                          {done ? <Check aria-hidden="true" /> : index + 1}
                        </button>
                      )
                    })}
                  </div>
                  <div className="progression">
                    <Sparkles aria-hidden="true" />
                    <span>{getProgression(exercise, profile)}</span>
                  </div>
                </div>
              ))}

              <div className="workout-actions">
                <button
                  className="secondary-action"
                  disabled={savingAction === `workout-${workout.id}`}
                  type="button"
                  onClick={() => void onSaveWorkout(workout)}
                >
                  {savingAction === `workout-${workout.id}` ? (
                    <Loader2 aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  Salvar cargas
                </button>
                <button
                  className="primary-action"
                  disabled={savingAction === `execution-${workout.id}`}
                  type="button"
                  onClick={() => void onSaveExecution(workout)}
                >
                  {savingAction === `execution-${workout.id}` ? (
                    <Loader2 aria-hidden="true" />
                  ) : (
                    <Plus aria-hidden="true" />
                  )}
                  Registrar execução
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Biblioteca de Exercícios">
        <div className="library-grid">
          {exerciseLibrary.map((exercise) => (
            <article key={exercise.id}>
              <strong>{exercise.name}</strong>
              <span>{exercise.target}</span>
              <small>
                {exercise.secondary} · {exercise.difficulty}
              </small>
              <a href={`#${exercise.video}`}>Ver vídeo</a>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Running({
  isSaving,
  metrics,
  onAdd,
  onDelete,
  runForm,
  runs,
  savingAction,
  setRunForm,
}: {
  isSaving: boolean
  metrics: Metrics
  onAdd: () => Promise<void>
  onDelete: (id: string) => Promise<void>
  runForm: {
    type: RunType
    distance: number
    time: number
    elevation: number
    avgHr: number
    maxHr: number
    cadence: number
    effort: number
  }
  runs: RunEntry[]
  savingAction: string
  setRunForm: React.Dispatch<React.SetStateAction<typeof runForm>>
}) {
  return (
    <div className="module-grid">
      <section className="stats-grid">
        <Stat detail="Volume registrado" icon={Route} label="Km semanais" value={`${formatNumber(metrics.weeklyKm, 1)} km`} />
        <Stat detail="Média ponderada" icon={Gauge} label="Pace médio" value={`${metrics.avgPace}/km`} />
        <Stat detail="Melhor treino" icon={Flame} label="Melhor pace" tone="good" value={`${metrics.bestPace}/km`} />
      </section>

      <Panel title="Registrar Corrida">
        <form className="form-grid compact">
          <label>
            Tipo
            <select
              value={runForm.type}
              onChange={(event) => setRunForm((current) => ({ ...current, type: event.target.value as RunType }))}
            >
              {runTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          {[
            ['distance', 'Distância', 'km'],
            ['time', 'Tempo', 'min'],
            ['elevation', 'Elevação', 'm'],
            ['avgHr', 'FC média', 'bpm'],
            ['maxHr', 'FC máxima', 'bpm'],
            ['cadence', 'Cadência', 'ppm'],
            ['effort', 'Esforço', '/10'],
          ].map(([field, label, suffix]) => (
            <label key={field}>
              {label}
              <span className="input-with-suffix">
                <input
                  max={field === 'effort' ? 10 : undefined}
                  min={field === 'effort' ? 1 : 0}
                  step={field === 'distance' ? 0.1 : 1}
                  type="number"
                  value={runForm[field as keyof typeof runForm]}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      [field]: Number(event.target.value),
                    }))
                  }
                />
                <small>{suffix}</small>
              </span>
            </label>
          ))}
        </form>
        <button className="primary-action" disabled={isSaving} type="button" onClick={onAdd}>
          {isSaving ? <Loader2 aria-hidden="true" /> : <Plus aria-hidden="true" />}
          Salvar corrida
        </button>
      </Panel>

      <Panel title="Histórico e Zonas">
        <div className="run-list">
          {runs.map((run) => (
            <article key={run.id}>
              <div>
                <strong>{run.type}</strong>
                <span>{new Date(`${run.date}T00:00:00`).toLocaleDateString('pt-BR')}</span>
              </div>
              <small>{run.distance} km</small>
              <small>{run.pace}/km</small>
              <small>{run.avgHr}-{run.maxHr} bpm</small>
              <div className="zone-pill">Z{Math.min(5, Math.max(1, Math.round(run.avgHr / 35)))}</div>
              <button
                className="danger-action"
                disabled={savingAction === `run-${run.id}`}
                type="button"
                onClick={() => void onDelete(run.id)}
              >
                Excluir
              </button>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Integrações Futuras">
        <div className="integration-grid">
          {['Garmin', 'Strava', 'Coros', 'Polar', 'Apple Health', 'Google Fit'].map((item) => (
            <span key={item}>
              <Lock aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Hybrid({
  metrics,
  profile,
  recommendations,
}: {
  metrics: Metrics
  profile: Profile
  recommendations: string[]
}) {
  return (
    <div className="module-grid">
      <Panel title="Inteligência Híbrida" action={`Recovery ${metrics.recovery}%`}>
        <div className="hybrid-score">
          <div>
            <span>{metrics.recovery}%</span>
            <strong>Recovery score</strong>
          </div>
          <div className="readiness-factors">
            <ProgressBar label="Sono" value={Math.round((profile.sleep / 10) * 100)} />
            <ProgressBar label="Baixa fadiga" value={100 - profile.fatigue * 10} />
            <ProgressBar label="Baixa dor" value={100 - profile.soreness * 10} />
          </div>
        </div>
      </Panel>

      <Panel title="Regras Críticas">
        <div className="rule-list">
          {recommendations.map((item) => (
            <article key={item}>
              <Sparkles aria-hidden="true" />
              <div>
                <strong>IA Coach</strong>
                <span>{item}</span>
              </div>
              <ChevronRight aria-hidden="true" />
            </article>
          ))}
          <article>
            <HeartPulse aria-hidden="true" />
            <div>
              <strong>Overtraining</strong>
              <span>Fadiga alta, baixa recuperação e FC alterada acionam recomendação de descanso.</span>
            </div>
            <ChevronRight aria-hidden="true" />
          </article>
        </div>
      </Panel>
    </div>
  )
}

function Periodization() {
  const cycles = [
    ['Macro ciclo', '6 meses', 'Construção para meia maratona com hipertrofia de suporte'],
    ['Meso ciclo', '4 semanas', 'Base aeróbica, força submáxima e controle de fadiga'],
    ['Micro ciclo', 'Semana atual', '2 treinos de força, 3 corridas e 1 bloco regenerativo'],
  ]

  return (
    <div className="module-grid">
      <Panel title="Periodização">
        <div className="cycle-grid">
          {cycles.map(([title, duration, detail]) => (
            <article key={title}>
              <span>{duration}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Replanejamento Automático">
        <div className="kanban">
          {['Planejado', 'Executado', 'Ajustado'].map((column) => (
            <div key={column}>
              <strong>{column}</strong>
              <article>{column === 'Planejado' ? 'Tiro 6 x 600 m' : column === 'Executado' ? 'Upper A completo' : 'Lower com -20% volume'}</article>
              <article>{column === 'Planejado' ? 'Longão 16 km' : column === 'Executado' ? 'Regenerativo 6 km' : 'Sono + mobilidade'}</article>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Social() {
  return (
    <div className="module-grid">
      <section className="stats-grid">
        <Stat detail="Streak diário" icon={Flame} label="Sequência" tone="good" value="12 dias" />
        <Stat detail="Gamificação" icon={Award} label="XP" value="7.420" />
        <Stat detail="Ranking do grupo" icon={Medal} label="Posição" value="#3" />
      </section>

      <Panel title="Comunidade">
        <div className="social-feed">
          {[
            ['Equipe 21K', 'Desafio semanal: 32 km com 2 sessões de força.'],
            ['Assessoria Evo', 'Ranking atualizado por aderência e evolução.'],
            ['Marina Costa', 'PR de 5 km estimado em 25:40.'],
          ].map(([author, content]) => (
            <article key={content}>
              <strong>{author}</strong>
              <span>{content}</span>
              <button type="button">Curtir</button>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Admin() {
  return (
    <div className="module-grid">
      <Panel title="Administração">
        <div className="admin-grid">
          {[
            ['Usuários', '1.284 ativos', Users],
            ['Planos', 'Free, Premium, Assessoria', Lock],
            ['Segurança', 'JWT, OAuth2, criptografia', ShieldCheck],
            ['Analytics', 'Retenção, aderência, evolução', BarChart3],
          ].map(([title, detail, Icon]) => (
            <article key={title as string}>
              <Icon aria-hidden="true" />
              <strong>{title as string}</strong>
              <span>{detail as string}</span>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Roadmap">
        <div className="roadmap">
          {[
            ['Fase 1', 'Cadastro, treinos, execução, corrida básica, dashboard.'],
            ['Fase 2', 'IA básica, progressão automática, gráficos, periodização.'],
            ['Fase 3', 'Wearables, IA avançada, coach virtual, comunidade.'],
          ].map(([phase, detail]) => (
            <article key={phase}>
              <strong>{phase}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export default App
