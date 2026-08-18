-- AlterTable
ALTER TABLE "public"."attempts" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."quizzes" ADD COLUMN     "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
