export const APP_NAME = "TravelEase";
export const APP_DESCRIPTION =
  "Discover amazing destinations and book unforgettable tour packages with TravelEase.";

export const ROUTES = {
  home: "/",
  about: "/about",
  destinations: "/destinations",
  tours: "/tours",
  gallery: "/gallery",
  blog: "/blog",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  admin: "/admin",
  bookingConfirmation: (bookingNumber: string) =>
    `/dashboard/bookings/${bookingNumber}`,
  tourBook: (slug: string) => `/tours/${slug}/book`,
} as const;

export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

export const SITE_STATS = {
  happyCustomers: 12500,
  toursCompleted: 3200,
  destinations: 48,
  yearsExperience: 15,
} as const;

export const WHY_CHOOSE_US = [
  {
    title: "Professional Tour Guides",
    description:
      "Expert local guides who bring every destination to life with insider knowledge.",
    icon: "MapPin",
  },
  {
    title: "Affordable Pricing",
    description:
      "Premium experiences at competitive prices with transparent, no-hidden-fee booking.",
    icon: "BadgeDollarSign",
  },
  {
    title: "Secure Booking",
    description:
      "Your data and bookings are protected with enterprise-grade security.",
    icon: "ShieldCheck",
  },
  {
    title: "Best Customer Service",
    description:
      "24/7 support before, during, and after your trip for complete peace of mind.",
    icon: "Headphones",
  },
] as const;
