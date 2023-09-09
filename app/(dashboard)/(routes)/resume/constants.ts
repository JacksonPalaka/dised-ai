import * as z from "zod";

export const formSchema = z.object({
  prompt1: z.string().min(1, {
    message: "Resume is required."
  }),
  prompt2: z.string().min(1, {
    message: "job description is required."
  }),

});
