export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type UserRole = "customer" | "admin";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type Difficulty = "easy" | "moderate" | "hard";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TourLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface TravelerInfo {
  name: string;
  age?: number;
}
