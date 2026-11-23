/**
 * Concurrency tests for booking and cancelling.
 *
 * These run against a REAL Postgres database, because the bugs they guard
 * against (two requests racing for the last seat) only show up with real
 * transactions and row locks. Mocks would always pass.
 *
 *   1. Create an empty test database (NOT your Supabase production DB).
 *   2. DATABASE_URL=<test db url> npm run db:push
 *   3. TEST_DATABASE_URL=<test db url> npm test
 */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const testDbUrl = process.env.TEST_DATABASE_URL;
if (!testDbUrl) {
  throw new Error(
    "Set TEST_DATABASE_URL to a throwaway database. These tests write and delete rows.",
  );
}
// Must be set before "@/lib/db" is imported, so the app connects to the test DB.
process.env.DATABASE_URL = testDbUrl;

const { db } = await import("@/lib/db");
const { bookings, categories, destinations, tours, user } = await import(
  "@/lib/db/schema"
);
const { createBooking, cancelBooking } = await import(
  "@/services/bookings.service"
);
const { updateBookingStatus } = await import(
  "@/services/admin/content.service"
);
const { eq, inArray } = await import("drizzle-orm");

const runId = randomUUID().slice(0, 8);
const userIds: string[] = [];
let destinationId = "";
let categoryId = "";
const tourIds: string[] = [];

function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

async function makeUser() {
  const id = `test-${runId}-${userIds.length}`;
  await db.insert(user).values({
    id,
    name: "Test User",
    email: `${id}@example.test`,
  });
  userIds.push(id);
  return id;
}

async function makeTour(availableSeats: number) {
  const [tour] = await db
    .insert(tours)
    .values({
      destinationId,
      categoryId,
      title: "Test tour",
      slug: `test-tour-${runId}-${tourIds.length}`,
      description: "Test",
      duration: "1 day",
      price: "100.00",
      maxGuests: 10,
      availableSeats,
      coverImage: "https://example.test/cover.jpg",
    })
    .returning();
  tourIds.push(tour!.id);
  return tour!;
}

async function seatsLeft(tourId: string) {
  const [row] = await db
    .select({ seats: tours.availableSeats })
    .from(tours)
    .where(eq(tours.id, tourId));
  return row!.seats;
}

function book(userId: string, tourId: string, travelers = 1) {
  return createBooking(userId, {
    tourId,
    travelDate: futureDate(),
    travelers,
    travelerInfo: Array.from({ length: travelers }, (_, i) => ({
      name: `Traveler ${i + 1}`,
    })),
  });
}

before(async () => {
  const [dest] = await db
    .insert(destinations)
    .values({
      name: "Test destination",
      slug: `test-dest-${runId}`,
      country: "Thailand",
      city: "Bangkok",
      description: "Test",
      image: "https://example.test/dest.jpg",
    })
    .returning();
  destinationId = dest!.id;

  const [cat] = await db
    .insert(categories)
    .values({ name: "Test category", slug: `test-cat-${runId}` })
    .returning();
  categoryId = cat!.id;
});

after(async () => {
  if (tourIds.length) {
    await db.delete(bookings).where(inArray(bookings.tourId, tourIds));
    await db.delete(tours).where(inArray(tours.id, tourIds));
  }
  if (userIds.length) await db.delete(user).where(inArray(user.id, userIds));
  if (categoryId) await db.delete(categories).where(eq(categories.id, categoryId));
  if (destinationId) {
    await db.delete(destinations).where(eq(destinations.id, destinationId));
  }
  // Close the pool so the test process can exit.
  await (db as unknown as { $client: { end: () => Promise<void> } }).$client.end();
});

describe("booking the last seats", () => {
  test("two customers racing for the last seat: exactly one wins", async () => {
    const tour = await makeTour(1);
    const [a, b] = [await makeUser(), await makeUser()];

    const results = await Promise.all([book(a, tour.id), book(b, tour.id)]);

    const wins = results.filter((r) => r.success);
    const losses = results.filter((r) => !r.success);
    assert.equal(wins.length, 1, "exactly one booking should succeed");
    assert.equal(losses.length, 1);
    assert.match(losses[0]!.error!, /Only 0 seats available/);

    assert.equal(await seatsLeft(tour.id), 0);
    const saved = await db
      .select()
      .from(bookings)
      .where(eq(bookings.tourId, tour.id));
    assert.equal(saved.length, 1, "only one booking row should be saved");
  });

  test("ten customers for three seats: three win, seats never go negative", async () => {
    const tour = await makeTour(3);
    const users = await Promise.all(Array.from({ length: 10 }, makeUser));

    const results = await Promise.all(users.map((u) => book(u, tour.id)));

    assert.equal(results.filter((r) => r.success).length, 3);
    assert.equal(await seatsLeft(tour.id), 0);
  });

  test("concurrent bookings get unique booking numbers", async () => {
    const tour = await makeTour(10);
    const users = await Promise.all(Array.from({ length: 8 }, makeUser));

    const results = await Promise.all(users.map((u) => book(u, tour.id)));

    assert.ok(results.every((r) => r.success), "all 8 should fit in 10 seats");
    const numbers = results.map((r) => (r.success ? r.data.bookingNumber : ""));
    assert.equal(new Set(numbers).size, numbers.length, "numbers must be unique");
    assert.equal(await seatsLeft(tour.id), 2);
  });
});

describe("cancelling", () => {
  test("double-clicking Cancel returns the seats only once", async () => {
    const tour = await makeTour(5);
    const u = await makeUser();
    const booked = await book(u, tour.id, 2);
    assert.ok(booked.success);
    assert.equal(await seatsLeft(tour.id), 3);

    const results = await Promise.all([
      cancelBooking(booked.data.bookingNumber, u),
      cancelBooking(booked.data.bookingNumber, u),
    ]);

    assert.equal(results.filter((r) => r.success).length, 1);
    assert.equal(await seatsLeft(tour.id), 5, "seats restored exactly once");
  });

  test("customer and admin cancelling at once return the seats only once", async () => {
    const tour = await makeTour(5);
    const u = await makeUser();
    const booked = await book(u, tour.id, 2);
    assert.ok(booked.success);

    const results = await Promise.all([
      cancelBooking(booked.data.bookingNumber, u),
      updateBookingStatus(booked.data.id, "cancelled"),
    ]);

    assert.equal(results.filter((r) => r.success).length, 1);
    assert.equal(await seatsLeft(tour.id), 5);
  });

  test("cancelling does not cap seats at maxGuests", async () => {
    // maxGuests is the limit per booking (10), not the tour's capacity (30).
    const tour = await makeTour(30);
    const u = await makeUser();
    const booked = await book(u, tour.id, 2);
    assert.ok(booked.success);

    const cancelled = await cancelBooking(booked.data.bookingNumber, u);
    assert.ok(cancelled.success);
    assert.equal(await seatsLeft(tour.id), 30);
  });

  test("a cancelled booking cannot be re-confirmed by an admin", async () => {
    const tour = await makeTour(5);
    const u = await makeUser();
    const booked = await book(u, tour.id);
    assert.ok(booked.success);
    assert.ok((await cancelBooking(booked.data.bookingNumber, u)).success);

    const result = await updateBookingStatus(booked.data.id, "confirmed");
    assert.equal(result.success, false);
    assert.equal(await seatsLeft(tour.id), 5);
  });
});
