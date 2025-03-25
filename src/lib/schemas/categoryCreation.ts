import {z} from 'zod';

export const categoryValidationSchema=  z.object({
  name:z.string()
    .min(3,{message:"Name must be atleast 3 characters long"})
    .max(50,{message:"Name cannot exceed 50 characters"}),
  description:z.string()
    .min(10,{message : "Description must be at least 10 characters long"})
     .max(500,{message:"description cannot exceed 500 characters"}),
  evaluationParameters: z.array(
    z.string()
      .min(2,{message : "Evaluation parameter must be atleast 2 characters"})
      .max(30,{message : "Evaluation parameter cannot excedd 30 character"})
    ).min(1,{message : "Atleast 1 evaluation parameter is required"})
    .max(5,{message:"At most 5 evaluation parameters are required"}),

    deadline : z.string()
    .refine((date)=> new Date(date) > new Date(),{
      message : "Deadline must be in the future"
    })
});

export type CategoryFormValues= z.infer<typeof categoryValidationSchema>;

