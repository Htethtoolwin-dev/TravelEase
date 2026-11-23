-- Booking numbers now come from a sequence instead of MAX(booking_number) + 1,
-- which could hand the same number to two concurrent bookings.
-- Safe to run more than once. Starts after the highest existing number.

CREATE SEQUENCE IF NOT EXISTS booking_number_seq;

SELECT setval(
  'booking_number_seq',
  GREATEST(
    (SELECT COALESCE(MAX(split_part(booking_number, '-', 3)::bigint), 0) FROM bookings),
    (SELECT last_value FROM booking_number_seq),
    1
  )
);
