export const dashboardPeriods = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
  { value: "sixMonths", label: "6 oylik" },
  { value: "year", label: "1 yillik" },
];

export function getDashboardPeriod(period, now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now);
  const get = (name) => Number(parts.find((part) => part.type === name).value);
  const date = new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
  const end = date.getTime() + 86400000 - 5 * 3600000;
  if (period === "week") date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  if (period === "month") date.setUTCDate(1);
  if (period === "sixMonths") {
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - 5);
  }
  if (period === "year") date.setUTCMonth(0, 1);
  return { start: date.getTime() - 5 * 3600000, end };
}
