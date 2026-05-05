export function formatDate(dateString: string, locale = "es-BO"): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(
  amount: number,
  currency = "BOB",
  locale = "es-BO"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
