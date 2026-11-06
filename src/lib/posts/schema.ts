import { z } from "zod";

import { parsePostDate } from "./utils";

function isValidCalendarDate(value: string): boolean {
  const date = parsePostDate(value);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format")
  .refine(isValidCalendarDate, "Enter a valid calendar date");

export const postFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    tags: z.array(z.string().trim().min(1, "Tags cannot be empty")),
    draft: z.boolean(),
    publishedAt: isoDate,
    updatedAt: isoDate.optional(),
    coverImage: z.string().trim().min(1, "Cover image path cannot be empty").optional(),
    content: z.string(),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt cannot be earlier than publishedAt",
    path: ["updatedAt"],
  });
