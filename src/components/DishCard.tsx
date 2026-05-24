import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { getDishImage } from "@/lib/dishImages";
import type { Dish, Lang } from "@/lib/types";

interface Props {
  dish: Dish;
  price: number;
  quantity: number;
  onChange: (q: number) => void;
  index?: number;
}

export function DishCard({ dish, price, quantity, onChange, index = 0 }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const name = lang === "ar" ? dish.name_ar : lang === "tr" ? dish.name_tr : dish.name_en;
  const img = getDishImage(dish.image_url);
  const active = quantity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.045, 0.32), ease: [0.22, 1, 0.36, 1] }}
      className={[
        "flex items-center gap-4 rounded-2xl bg-card px-3.5 py-3 transition-shadow",
        active
          ? "border border-primary/40 shadow-[0_10px_28px_-14px_var(--primary)]"
          : "border border-border shadow-[0_2px_10px_-6px_rgba(0,0,0,0.08)]",
      ].join(" ")}
    >
      <div className="relative h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] shrink-0 rounded-2xl overflow-hidden dish-shadow">
        {img ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            width={184}
            height={184}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="dish-placeholder h-full w-full grid place-items-center text-white/85">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl pointer-events-none" />
        {active && (
          <div className="absolute top-1.5 start-1.5 min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold tnum shadow">
            {quantity}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {name.length > 32 ? (
          <div className="marquee-mask text-[15px] font-semibold tracking-tight text-foreground">
            <span
              className="marquee-track"
              style={{ ["--marquee-shift" as string]: "-50%" }}
            >
              <span className="pe-10">{name}</span>
              <span className="pe-10" aria-hidden="true">{name}</span>
            </span>
          </div>
        ) : (
          <h3 className="text-[15.5px] font-semibold tracking-tight leading-snug text-foreground line-clamp-2">
            {name}
          </h3>
        )}
        <p className="mt-1.5 text-[13.5px] font-semibold tnum text-foreground/90">
          <span className="text-primary">{price}</span>{" "}
          <span className="text-[11px] font-medium text-muted-foreground">{t("currency")}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <motion.button
          whileTap={{ scale: 0.85, rotate: -12 }}
          onClick={() => onChange(Math.max(0, quantity - 1))}
          disabled={quantity === 0}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition disabled:opacity-30"
          aria-label="decrease"
        >
          <Minus className="h-4 w-4" />
        </motion.button>
        <span className="w-5 text-center text-[15px] font-bold tnum">
          {quantity}
        </span>
        <motion.button
          whileTap={{ scale: 0.85, rotate: 12 }}
          onClick={() => onChange(quantity + 1)}
          className="grid h-9 w-9 place-items-center rounded-full btn-gradient text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)]"
          aria-label="increase"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

