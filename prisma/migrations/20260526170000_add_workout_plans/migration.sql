CREATE TABLE "workout_plans" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "split" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workouts" ADD COLUMN "trainingPlanId" TEXT;
ALTER TABLE "workouts" ADD COLUMN "planDayCode" TEXT;
ALTER TABLE "workouts" ADD COLUMN "planDayName" TEXT;
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "workout_plans_userId_idx" ON "workout_plans"("userId");
CREATE INDEX "workouts_trainingPlanId_idx" ON "workouts"("trainingPlanId");
