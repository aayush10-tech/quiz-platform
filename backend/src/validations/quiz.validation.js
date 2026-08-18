import { z } from "zod";

export const quizSchema = z.object({

    title:
        z.string()
            .trim()
            .min(3)
            .max(100),


    description:
        z.string()
            .trim()
            .min(10),


    instructions:
        z.string()
            .trim()
            .optional(),


    duration:
        z.number({
            invalid_type_error:
                "Duration must be a number"
        })
        .min(1),


    passingScore:
        z.number({
            invalid_type_error:
                "Passing score must be a number"
        })
        .min(1)
        .max(100),


    maxAttempts:
        z.number({
            invalid_type_error:
                "Max attempts must be a number"
        })
        .min(1),


    /*
     * Negative marking.
     *
     * 0     = no negative marking
     * 0.25  = -0.25 for wrong answer
     * 0.5   = -0.5 for wrong answer
     * 1     = -1 for wrong answer
     */

    negativeMarks:
        z.number({
            invalid_type_error:
                "Negative marks must be a number"
        })
        .min(0)
        .max(100)
        .default(0.5),


    difficulty:
        z.enum([
            "EASY",
            "MEDIUM",
            "HARD"
        ]),


    categoryId:
        z.number({
            invalid_type_error:
                "Category is required"
        })
        .int(),


    thumbnail:
        z.string()
        .optional(),


    isFeatured:
        z.boolean()
        .optional()

});