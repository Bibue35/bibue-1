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

// Username validation schema - sanitize dangerous characters
export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username cannot be empty" })
    .max(50, { message: "Username must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_\-\s]+$/, { message: "Username can only contain letters, numbers, underscores, hyphens, and spaces" }),
});

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

// Password validation schema with strength requirements
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

// URL validation schema for safe URLs
export const urlSchema = z.object({
  url: z
    .string()
    .url({ message: "Invalid URL format" })
    .max(500, { message: "URL must be less than 500 characters" })
    .refine((url) => url.startsWith('https://'), { message: "URL must use HTTPS" }),
});

// Watchlist notes validation
export const notesSchema = z.object({
  notes: z
    .string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
});

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Category name cannot be empty" })
    .max(50, { message: "Category name must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_\-\s]+$/, { message: "Category name can only contain letters, numbers, underscores, hyphens, and spaces" }),
  color: z
    .string()
    .max(20, { message: "Color must be less than 20 characters" })
    .optional(),
});

// Report validation schema
export const reportSchema = z.object({
  reportType: z
    .string()
    .min(1, { message: "Report type is required" })
    .max(50, { message: "Report type must be less than 50 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
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

// Validate username
export function validateUsername(username: string): { success: boolean; error?: string } {
  const result = usernameSchema.safeParse({ username });
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid username" };
  }
  return { success: true };
}

// Validate email
export function validateEmail(email: string): { success: boolean; error?: string } {
  const result = emailSchema.safeParse({ email });
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid email" };
  }
  return { success: true };
}

// Validate password strength
export function validatePassword(password: string): { success: boolean; error?: string } {
  const result = passwordSchema.safeParse({ password });
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid password" };
  }
  return { success: true };
}

// Validate array of IDs (for batch operations)
export function validateIds(ids: string[], validIds: string[]): { validIds: string[]; invalidCount: number } {
  const validSet = new Set(validIds);
  const filtered = ids.filter(id => validSet.has(id));
  return {
    validIds: filtered,
    invalidCount: ids.length - filtered.length,
  };
}

// Sanitize text content - remove potentially dangerous characters
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets (basic XSS prevention)
    .trim();
}

// Check if URL is from a trusted domain for images
export function isTrustedImageUrl(url: string): boolean {
  const trustedDomains = [
    'lh3.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com',
    'appleid.cdn-apple.com',
    'avatars.githubusercontent.com',
    'www.gravatar.com',
    'secure.gravatar.com',
    'cdn.discordapp.com',
    'i.imgur.com',
    'graphql.anilist.co',
    's4.anilist.co',
    'cdn.myanimelist.net',
  ];
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && trustedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}
