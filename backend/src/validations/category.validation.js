import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(50),

  description: z
    .string()
    .trim()
    .optional()
});