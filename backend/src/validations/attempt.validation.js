import { z } from "zod";

export const submitQuizSchema = z.object({

  attemptId: z.number(),

  answers: z.array(

    z.object({

      questionId: z.number(),

      optionId: z.number()

    })

  )

});