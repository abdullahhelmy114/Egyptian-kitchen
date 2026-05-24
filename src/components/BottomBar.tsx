import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  total: number;
  itemCount: number;
  onReserve: () => void;
  label?: string;
  disabled?: boolean;
}

export function BottomBar({ total, itemCount, onReserve, label, disabled }: Props) {
  const { t } = useTranslation();


  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-40 glass pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
        >
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-3 px-5">
            <div className="leading-tight">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("total")} · {itemCount}
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={total}
                  initial={{ scale: 1.18, opacity: 0, y: -4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 4 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className="text-2xl font-bold tnum text-foreground"
                >
                  {total}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t("currency")}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onReserve}
              disabled={disabled}
              className="flex items-center gap-2 rounded-full btn-gradient glow-primary text-primary-foreground px-5 h-12 font-semibold text-[15px] disabled:opacity-50"
            >
              {label ?? t("reserve")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
