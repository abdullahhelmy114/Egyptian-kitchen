import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addMonths,
  buildMonthGrid,
  getDayKey,
  isDayLocked,
  sameDay,
  startOfMonth,
} from "@/lib/dateUtils";
import type { DayKey, Lang } from "@/lib/types";

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
  /** Set of weekday keys that have at least one available dish (i.e., always all days here). */
  availableDays: Set<DayKey>;
}

export function MonthCalendar({ selected, onSelect, availableDays }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [anchor, setAnchor] = useState<Date>(startOfMonth(selected));
  const cells = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map(
    (i) => t(`weekdays_short.${i}`) as string,
  );
  const monthName = t(`months.${anchor.getMonth()}`) as string;
  const yearLabel = new Intl.NumberFormat(
    lang === "ar" ? "ar-EG" : lang === "tr" ? "tr-TR" : "en-US",
  ).format(anchor.getFullYear());

  return (
    <section className="rounded-3xl bg-card border border-border px-4 pt-4 pb-3">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          onClick={() => setAnchor(addMonths(anchor, -1))}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary transition text-foreground/80"
          aria-label="prev"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <AnimatePresence mode="wait">
          <motion.h2
            key={`${anchor.getFullYear()}-${anchor.getMonth()}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-xl font-semibold tracking-tight"
          >
            {monthName} <span className="text-muted-foreground font-normal">{yearLabel}</span>
          </motion.h2>
        </AnimatePresence>
        <button
          onClick={() => setAnchor(addMonths(anchor, 1))}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary transition text-foreground/80"
          aria-label="next"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2">
        {weekdayLabels.map((w, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground py-1"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} className="aspect-square" />;
          const locked = isDayLocked(cell, now) || !availableDays.has(getDayKey(cell));
          const isSelected = sameDay(cell, selected);
          const isToday = sameDay(cell, today);
          const hasDot = availableDays.has(getDayKey(cell)) && !isDayLocked(cell, now);

          return (
            <button
              key={idx}
              disabled={locked}
              onClick={() => onSelect(cell)}
              className={[
                "day-cell relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : locked
                    ? "text-[var(--quaternary)] cursor-not-allowed"
                    : "text-foreground hover:bg-secondary",
                isToday && !isSelected ? "ring-1 ring-primary/40" : "",
              ].join(" ")}
            >
              <span className={isToday ? "font-semibold" : ""}>
                {cell.getDate()}
              </span>
              {hasDot && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
