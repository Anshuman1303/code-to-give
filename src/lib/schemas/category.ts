import { z } from "zod";

export const categoryValidationSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }).max(50, { message: "Name cannot exceed 50 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "description cannot exceed 500 characters" }),
  evaluationParameters: z
    .array(
      z
        .string()
        .min(2, { message: "Evaluation parameter must be at least 2 characters" })
        .max(30, { message: "Evaluation parameter cannot exceed 30 character" })
    )
    .min(1, { message: "At least 1 evaluation parameter is required" })
    .max(10, { message: "At most 10 evaluation parameters" }),

  deadline: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Deadline must be in the future",
  }),
});

export type CategoryFormValues = z.infer<typeof categoryValidationSchema>;
