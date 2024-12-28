import { z } from "zod";

export const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(['CREDIT_CARD', 'LOAN', 'INSURANCE', 'CIBIL'], {
    required_error: "Category is required",
    invalid_type_error: "Invalid category",
  }),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  author: z.object({
    name: z.string().min(1, "Author name is required"),
    avatar: z.string().url().optional(),
  }),
  publishedAt: z.date().optional().default(() => new Date()),
  readingTime: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  seo: z.object({
    metaTitle: z.string().min(1, "Meta title is required").max(60, "Meta title too long"),
    metaDescription: z.string().min(1, "Meta description is required").max(160, "Meta description too long"),
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  }),
});

// For updates, we create a partial version
export const blogPostUpdateSchema = blogPostSchema.partial();

// For search/filter parameters
export const blogPostFilterSchema = z.object({
  category: z.enum(['CREDIT_CARD', 'LOAN', 'INSURANCE', 'CIBIL']).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type BlogPostSchema = z.infer<typeof blogPostSchema>;
export type BlogPostUpdateSchema = z.infer<typeof blogPostUpdateSchema>;
export type BlogPostFilterSchema = z.infer<typeof blogPostFilterSchema>;