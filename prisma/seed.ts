import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('evopace123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@evopace.app' },
    update: {},
    create: {
      name: 'Marina Costa',
      email: 'demo@evopace.app',
      passwordHash,
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
    },
  })

  await prisma.bodyAssessment.deleteMany({ where: { userId: user.id } })
  await prisma.run.deleteMany({ where: { userId: user.id } })

  await prisma.bodyAssessment.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2026-03-01'),
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
        userId: user.id,
        date: new Date('2026-05-24'),
        weight: 68,
        bodyFat: 21.8,
        muscleMass: 49.5,
        waist: 74.5,
        chest: 92.5,
        thigh: 58,
        vo2: 46,
        restingHr: 56,
      },
    ],
  })

  await prisma.run.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2026-05-20'),
        type: 'regenerativo',
        distance: 6,
        timeMinutes: 39,
        paceSeconds: 390,
        elevation: 42,
        avgHr: 139,
        maxHr: 154,
        cadence: 166,
        effort: 4,
      },
      {
        userId: user.id,
        date: new Date('2026-05-25'),
        type: 'longo',
        distance: 14,
        timeMinutes: 88,
        paceSeconds: 377,
        elevation: 112,
        avgHr: 151,
        maxHr: 169,
        cadence: 170,
        effort: 7,
      },
    ],
  })

  const existingWorkout = await prisma.workout.findFirst({
    where: { userId: user.id, name: 'Lower A' },
  })

  if (!existingWorkout) {
    await prisma.workout.create({
      data: {
        userId: user.id,
        name: 'Lower A',
        split: 'Upper/lower',
        focus: 'Pernas pesado',
        exercises: {
          create: [
            {
              name: 'Agachamento livre',
              instruction: 'Desça mantendo coluna neutra, joelhos alinhados e controle total do tronco.',
              targetMuscle: 'Quadríceps',
              secondaryMuscles: 'Glúteos, core',
              equipment: 'Barra',
              difficulty: 'intermediário',
              sets: 4,
              reps: '5-6',
              load: 72,
              restSeconds: 150,
              rpe: 8,
              order: 0,
            },
            {
              name: 'Levantamento terra romeno',
              instruction: 'Projete o quadril para trás e mantenha a barra próxima ao corpo.',
              targetMuscle: 'Posterior de coxa',
              secondaryMuscles: 'Glúteos, lombar',
              equipment: 'Barra ou halteres',
              difficulty: 'intermediário',
              sets: 3,
              reps: '8',
              load: 64,
              restSeconds: 120,
              rpe: 8,
              order: 1,
            },
          ],
        },
      },
    })
  }

  console.log('Seed concluído. Login: demo@evopace.app / evopace123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
