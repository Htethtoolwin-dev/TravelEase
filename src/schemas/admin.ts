import { z } from "zod";

export const destinationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  country: z.string().min(2),
  city: z.string().min(2),
  description: z.string().min(10),
  image: z.string().url("Must be a valid URL"),
  featured: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
});

export const tourSchema = z.object({
  destinationId: z.string().uuid(),
  categoryId: z.string().uuid(),
  title: z.string().min(3),
  slug: z.string().min(2).optional(),
  description: z.string().min(20),
  duration: z.string().min(3),
  difficulty: z.enum(["easy", "moderate", "hard"]),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  maxGuests: z.coerce.number().int().positive(),
  availableSeats: z.coerce.number().int().min(0),
  featured: z.boolean().default(false),
  coverImage: z.string().url(),
  highlights: z.string().optional(),
  included: z.string().optional(),
  excluded: z.string().optional(),
  tourGuide: z.string().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(2).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(20),
  coverImage: z.string().url(),
  published: z.boolean().default(false),
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  image: z.string().url(),
  category: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const siteStatsSchema = z.object({
  happyCustomers: z.coerce.number().int().min(0),
  toursCompleted: z.coerce.number().int().min(0),
  destinations: z.coerce.number().int().min(0),
  yearsExperience: z.coerce.number().int().min(0),
});

export const siteContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(5),
});

export type DestinationInput = z.infer<typeof destinationSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TourInput = z.infer<typeof tourSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;

export function parseListField(value?: string | null) {
  if (!value?.trim()) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
