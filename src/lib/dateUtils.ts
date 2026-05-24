import { CUTOFF_HOUR } from "@/config";
import type { DayKey, Lang } from "./types";

export const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getDayKey(d: Date): DayKey {
  return DAY_KEYS[d.getDay()];
}

/** Returns the default selected date based on the cutoff rule. */
export function getDefaultDate(now = new Date()): Date {
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  const offset = now.getHours() >= CUTOFF_HOUR ? 2 : 1;
  base.setDate(base.getDate() + offset);
  return base;
}

/** A day is locked if it's less than 24h away (or in the past). */
export function isDayLocked(day: Date, now = new Date()): boolean {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const earliestAllowed = getDefaultDate(now);
  return dayStart.getTime() < earliestAllowed.getTime();
}

/** Returns true if an order's meal date is still > 24h away. */
export function canModifyOrder(orderDate: string, now = new Date()): boolean {
  const [y, m, d] = orderDate.split("-").map(Number);
  const target = new Date(y, m - 1, d, 0, 0, 0, 0);
  const diffHours = (target.getTime() - now.getTime()) / 36e5;
  return diffHours >= 24;
}

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(d: Date, lang: Lang): string {
  const locale = lang === "ar" ? "ar-EG" : lang === "tr" ? "tr-TR" : "en-US";
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function buildMonthGrid(monthAnchor: Date): (Date | null)[] {
  const first = startOfMonth(monthAnchor);
  const daysInMonth = new Date(
    monthAnchor.getFullYear(),
    monthAnchor.getMonth() + 1,
    0,
  ).getDate();
  const startWeekday = first.getDay(); // 0 = Sunday
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), i));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
