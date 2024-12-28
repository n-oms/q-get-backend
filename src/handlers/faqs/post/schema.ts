import { z } from "zod";

export enum FaqPostActions {
  CREATE_FAQ = "CREATE_FAQ",
  UPDATE_FAQ = "UPDATE_FAQ",
}

export const postFaqsSchema = z.object({
  action: z.nativeEnum(FaqPostActions),
  data: z.object({
    id: z.string().optional(),
    question: z.string(),
    answer: z.string(),
    coverImageUrl: z.string().optional(),
  }),
});
