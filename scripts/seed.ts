import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function seed() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/lib/db");
  const {
    categories,
    destinations,
    tours,
    blogs,
    gallery,
    siteSettings,
    user,
  } = await import("@/lib/db/schema");
  const { auth } = await import("@/lib/auth");

  console.log("Seeding database...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@travelease.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (process.env.NODE_ENV === "production" && !adminPassword) {
    console.log("Skipping admin seed in production (set SEED_ADMIN_PASSWORD to create one).");
  } else {
    const password = adminPassword ?? "Admin123!";
    try {
      await auth.api.signUpEmail({
        body: {
          name: "Admin User",
          email: adminEmail,
          password,
        },
      });
      await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.email, adminEmail));
      console.log(`Admin user created: ${adminEmail}`);
      if (!adminPassword) {
        console.log("Using default dev password — change immediately in production.");
      }
    } catch {
      console.log("Admin user may already exist, skipping...");
    }
  }

  const categoryData = [
    { name: "Adventure", slug: "adventure", description: "Thrilling outdoor experiences" },
    { name: "Cultural", slug: "cultural", description: "Immerse in local traditions" },
    { name: "Beach", slug: "beach", description: "Relax by the ocean" },
    { name: "City Tours", slug: "city-tours", description: "Explore urban wonders" },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryData)
    .onConflictDoNothing()
    .returning();

  const destinationData = [
    {
      name: "Bali",
      slug: "bali",
      country: "Indonesia",
      city: "Denpasar",
      description: "Tropical paradise with temples, beaches, and rice terraces.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      featured: true,
    },
    {
      name: "Paris",
      slug: "paris",
      country: "France",
      city: "Paris",
      description: "The City of Light — art, cuisine, and iconic landmarks.",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      featured: true,
    },
    {
      name: "Tokyo",
      slug: "tokyo",
      country: "Japan",
      city: "Tokyo",
      description: "A vibrant blend of ancient tradition and cutting-edge modernity.",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      featured: true,
    },
    {
      name: "Santorini",
      slug: "santorini",
      country: "Greece",
      city: "Oia",
      description: "Stunning white-washed villages overlooking the Aegean Sea.",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
      featured: false,
    },
    {
      name: "Swiss Alps",
      slug: "swiss-alps",
      country: "Switzerland",
      city: "Zermatt",
      description: "Majestic mountains, pristine lakes, and charming villages.",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      featured: true,
    },
    {
      name: "Bangkok",
      slug: "bangkok",
      country: "Thailand",
      city: "Bangkok",
      description: "Bustling markets, ornate temples, and world-famous street food.",
      image: "https://images.unsplash.com/photo-1563492065-9a066b4a4a8a?w=800",
      featured: false,
    },
  ];

  const insertedDestinations = await db
    .insert(destinations)
    .values(destinationData)
    .onConflictDoNothing()
    .returning();

  if (insertedCategories.length > 0 && insertedDestinations.length > 0) {
    const tourData = [
      {
        destinationId: insertedDestinations[0].id,
        categoryId: insertedCategories[2].id,
        title: "Bali Paradise Escape",
        slug: "bali-paradise-escape",
        description:
          "Experience the best of Bali with temple visits, rice terrace hikes, and beach relaxation.",
        duration: "7 Days / 6 Nights",
        difficulty: "easy" as const,
        price: "1299.00",
        discountPrice: "1099.00",
        maxGuests: 15,
        availableSeats: 12,
        featured: true,
        coverImage:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
        highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Nusa Penida Day Trip"],
        included: ["Accommodation", "Daily Breakfast", "Airport Transfer", "Tour Guide"],
        excluded: ["Flights", "Travel Insurance", "Personal Expenses"],
        tourGuide: "Made Wijaya",
      },
      {
        destinationId: insertedDestinations[1].id,
        categoryId: insertedCategories[3].id,
        title: "Paris City Lights",
        slug: "paris-city-lights",
        description:
          "Discover Paris through its art, architecture, cuisine, and romantic ambiance.",
        duration: "5 Days / 4 Nights",
        difficulty: "easy" as const,
        price: "1899.00",
        maxGuests: 12,
        availableSeats: 8,
        featured: true,
        coverImage:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
        highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"],
        included: ["Hotel", "Metro Pass", "Guided Tours", "Welcome Dinner"],
        excluded: ["Flights", "Lunch & Dinner", "Museum Entry Fees"],
        tourGuide: "Marie Dubois",
      },
      {
        destinationId: insertedDestinations[2].id,
        categoryId: insertedCategories[1].id,
        title: "Tokyo Cultural Journey",
        slug: "tokyo-cultural-journey",
        description:
          "Explore ancient temples, modern districts, and authentic Japanese cuisine.",
        duration: "6 Days / 5 Nights",
        difficulty: "moderate" as const,
        price: "1599.00",
        maxGuests: 10,
        availableSeats: 6,
        featured: true,
        coverImage:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
        highlights: ["Senso-ji Temple", "Shibuya Crossing", "Mt. Fuji Day Trip"],
        included: ["Ryokan Stay", "JR Pass", "Cultural Workshops", "Guide"],
        excluded: ["Flights", "Some Meals", "Personal Shopping"],
        tourGuide: "Yuki Tanaka",
      },
    ];

    await db.insert(tours).values(tourData).onConflictDoNothing();
    console.log(`Seeded ${tourData.length} tours`);
  }

  await db
    .insert(blogs)
    .values([
      {
        title: "Top 10 Hidden Gems in Southeast Asia",
        slug: "hidden-gems-southeast-asia",
        excerpt: "Discover off-the-beaten-path destinations that will take your breath away.",
        content: "Southeast Asia is full of hidden treasures waiting to be explored...",
        coverImage:
          "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
        published: true,
        publishedAt: new Date(),
      },
      {
        title: "Ultimate Guide to European Summer Travel",
        slug: "european-summer-travel-guide",
        excerpt: "Everything you need to know for the perfect European summer vacation.",
        content: "Summer in Europe offers endless possibilities...",
        coverImage:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
        published: true,
        publishedAt: new Date(),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(gallery)
    .values([
      {
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        title: "Travel Adventure",
        category: "Nature",
        sortOrder: 1,
      },
      {
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4fd267?w=800",
        title: "Mountain Lake",
        category: "Nature",
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(siteSettings)
    .values([
      {
        key: "stats",
        value: {
          happyCustomers: 12500,
          toursCompleted: 3200,
          destinations: 48,
          yearsExperience: 15,
        },
      },
      {
        key: "contact",
        value: {
          email: "hello@travelease.com",
          phone: "+66 2 123 4567",
          address: "123 Travel Street, Bangkok",
        },
      },
    ])
    .onConflictDoNothing();

  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
