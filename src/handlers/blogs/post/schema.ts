import { blogPostSchema } from "@/libs/services/mongo/validations/blogs";
import { z } from "zod";

export enum BlogsPostActions {
    CREATE_BLOG = "CREATE_BLOG",
    UPDATE_BLOG = "UPDATE_BLOG"
}

export const blogsPostSchema = z.object({
    action: z.nativeEnum(BlogsPostActions),
    data: blogPostSchema
});