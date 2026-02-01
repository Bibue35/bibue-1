import { z } from 'zod';

// Comment validation schema
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(5000, { message: "Comment must be less than 5000 characters" }),
});

// Discussion validation schema
export const discussionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title cannot be empty" })
    .max(200, { message: "Title must be less than 200 characters" }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Content cannot be empty" })
    .max(10000, { message: "Content must be less than 10000 characters" }),
});

// Validate comment content
export function validateComment(content: string): { success: boolean; error?: string } {
  const result = commentSchema.safeParse({ content });
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid comment" };
  }
  return { success: true };
}

// Validate discussion
export function validateDiscussion(title: string, content: string): { success: boolean; error?: string } {
  const result = discussionSchema.safeParse({ title, content });
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid discussion" };
  }
  return { success: true };
}
