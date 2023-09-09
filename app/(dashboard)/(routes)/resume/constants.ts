import * as z from "zod";

export const formSchema = z.object({
  resume: z.string().min(1, {
    message: "Resume is required."
  }),
  description: z.string().min(1, {
    message: "job description is required."
  }),

});
