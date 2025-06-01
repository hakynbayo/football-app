import * as z from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(100, {
      message: "Title must be less than 100 characters",
    }),
  description: z
    .string()
    .max(300, {
      message: "Description must be less than 300 characters",
    })
    .optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
