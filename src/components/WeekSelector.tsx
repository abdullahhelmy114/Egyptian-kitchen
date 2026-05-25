import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getDayKey,
  getDefaultDate,
  isDayLocked,
  formatDate,
} from "@/lib/dateUtils";
import type { DayKey, Lang } from "@/lib/types";

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
  availableDays: Set<DayKey>;
}

export function WeekSelector({ selected, onSelect, availableDays }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const isMobile = useIsMobile();
  const now = new Date();

  const days = useMemo(() => {
    const result: Date[] = [];
    const start = getDefaultDate(now);
    const totalDays = isMobile ? 5 : 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [isMobile]);

  const getShortDayLabel = (d: Date): string => {
    const dayIndex = d.getDay();
    return t(`weekdays_short.${dayIndex}`);
  };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 px-3 py-3">
      <div className="flex gap-1.5 justify-between">
        {days.map((d) => {
          const locked = isDayLocked(d, now);
          const isSelected =
            d.getDate() === selected.getDate() &&
            d.getMonth() === selected.getMonth() &&
            d.getFullYear() === selected.getFullYear();
          const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
          const dayKey = getDayKey(d);
          const hasDot = availableDays.has(dayKey) && !locked;

          return (
            <button
              key={d.toISOString()}
              onClick={() => !locked && onSelect(d)}
              disabled={locked}
              className={`
                flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl
                text-sm font-medium transition-all duration-300
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : locked
                    ? "text-quaternary cursor-not-allowed opacity-40"
                    : "text-foreground hover:bg-secondary active:scale-95"
                }
                ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}
              `}
            >
              <span className="text-xs opacity-80">
                {getShortDayLabel(d)}
              </span>
              <span className="text-base font-bold mt-0.5">
                {d.getDate()}
              </span>
              {hasDot && !isSelected && (
                <span className="mt-1 h-1 w-1 rounded-full bg-gold animate-pulse" />
              )}
              {locked && (
                <span className="mt-1 text-[10px]">🔒</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}