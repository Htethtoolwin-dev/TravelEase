export function formatPrice(value: string | number | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getEffectivePrice(
  price: string,
  discountPrice: string | null,
) {
  return discountPrice ?? price;
}
