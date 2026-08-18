import { z } from "zod";

export const questionSchema = z.object({
  questionText: z.string().trim().min(5),

  explanation: z.string().optional(),

  marks: z.number().min(1),

  questionOrder: z.number().min(1),

  quizId: z.number(),

  options: z
    .array(
      z.object({
        optionText: z.string().min(1),
        isCorrect: z.boolean()
      })
    )
    .length(4)
}).superRefine((data, ctx) => {

  const correctAnswers = data.options.filter(
    option => option.isCorrect
  );

  if (correctAnswers.length !== 1) {

    ctx.addIssue({

      code: "custom",

      message:
        "Exactly one option must be correct"

    });

  }

});