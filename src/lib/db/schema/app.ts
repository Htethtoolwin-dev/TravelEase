import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "moderate", "hard"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "refunded",
]);
export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const destinations = pgTable("destinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const tours = pgTable(
  "tours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    duration: text("duration").notNull(),
    difficulty: difficultyEnum("difficulty").default("easy").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
    maxGuests: integer("max_guests").notNull(),
    availableSeats: integer("available_seats").notNull(),
    featured: boolean("featured").default(false).notNull(),
    coverImage: text("cover_image").notNull(),
    highlights: jsonb("highlights").$type<string[]>().default([]),
    included: jsonb("included").$type<string[]>().default([]),
    excluded: jsonb("excluded").$type<string[]>().default([]),
    itinerary: jsonb("itinerary")
      .$type<{ day: number; title: string; description: string }[]>()
      .default([]),
    location: jsonb("location").$type<{
      address: string;
      lat: number;
      lng: number;
    }>(),
    tourGuide: text("tour_guide"),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default(
      "0",
    ),
    reviewCount: integer("review_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("tours_destination_id_idx").on(table.destinationId),
    index("tours_category_id_idx").on(table.categoryId),
    index("tours_featured_idx").on(table.featured),
  ],
);

export const tourImages = pgTable(
  "tour_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("tour_images_tour_id_idx").on(table.tourId)],
);

// Source of booking numbers (TRV-YYYY-000123). See nextBookingNumber().
export const bookingNumberSeq = pgSequence("booking_number_seq", {
  startWith: 1,
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingNumber: text("booking_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "restrict" }),
    travelDate: date("travel_date").notNull(),
    travelers: integer("travelers").notNull(),
    travelerInfo: jsonb("traveler_info")
      .$type<{ name: string; age?: number }[]>()
      .default([]),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    bookingStatus: bookingStatusEnum("booking_status")
      .default("pending")
      .notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("pending")
      .notNull(),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("bookings_user_id_idx").on(table.userId),
    index("bookings_tour_id_idx").on(table.tourId),
    index("bookings_status_idx").on(table.bookingStatus),
    index("bookings_created_at_idx").on(table.createdAt),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    status: reviewStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_user_tour_idx").on(table.userId, table.tourId),
    index("reviews_tour_status_idx").on(table.tourId, table.status),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("favorites_user_tour_idx").on(table.userId, table.tourId),
  ],
);

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  authorId: text("author_id").references(() => user.id, {
    onDelete: "set null",
  }),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gallery = pgTable("gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  image: text("image").notNull(),
  title: text("title").notNull(),
  category: text("category"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletter = pgTable("newsletter", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});
