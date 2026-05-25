import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { WeekSelector } from "@/components/WeekSelector";
import { DishCard } from "@/components/DishCard";
import { BottomBar } from "@/components/BottomBar";
import { getDayKey, getDefaultDate, ymd } from "@/lib/dateUtils";
import { buildWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp";
import type { DayKey, Dish, Lang } from "@/lib/types";

interface Row {
  id: string;
  price: number;
  is_available: boolean;
  day_of_week: DayKey;
  dish: Dish;
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [selected, setSelected] = useState<Date>(() => getDefaultDate());
  const [name, setName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: rows = [] } = useQuery<Row[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dish_availability")
        .select("id, price, is_available, day_of_week, dish:dishes(*)")
        .eq("is_available", true);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const availableDays = useMemo<Set<DayKey>>(() => {
    const s = new Set<DayKey>();
    for (const r of rows) s.add(r.day_of_week);
    return s;
  }, [rows]);

  const dayKey = getDayKey(selected);
  const dayRows = rows.filter((r) => r.day_of_week === dayKey);
  const mains = dayRows.filter((r) => r.dish.category === "main");
  const extras = dayRows.filter((r) => r.dish.category === "extra");

  useEffect(() => {
    setQuantities({});
  }, [selected]);

  const items = dayRows
    .map((r) => ({ row: r, qty: quantities[r.id] ?? 0 }))
    .filter((x) => x.qty > 0);
  const total = items.reduce((s, x) => s + x.row.price * x.qty, 0);
  const itemCount = items.reduce((s, x) => s + x.qty, 0);

  const handleReserve = async () => {
    if (!name.trim()) {
      toast.error(t("enter_name"));
      return;
    }
    if (items.length === 0) {
      toast.error(t("no_items"));
      return;
    }
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: name.trim(),
        order_date: ymd(selected),
        language: lang,
      })
      .select()
      .single();
    if (error || !order) {
      toast.error(error?.message ?? "Error");
      return;
    }
    const itemsPayload = items.map((x) => ({
      order_id: order.id,
      dish_id: x.row.dish.id,
      quantity: x.qty,
    }));
    await supabase.from("order_items").insert(itemsPayload);

    const msg = buildWhatsAppMessage({
      customerName: name.trim(),
      date: selected,
      items: items.map((x) => ({
        name:
          lang === "ar"
            ? x.row.dish.name_ar
            : lang === "tr"
            ? x.row.dish.name_tr
            : x.row.dish.name_en,
        qty: x.qty,
        price: x.row.price,
      })),
      total,
      lang,
      variant: "new",
    });
    openWhatsApp(msg);
    toast.success(t("success"));
    setQuantities({});
  };

  return (
    <div className="min-h-screen bg-background pb-44">
      <main className="mx-auto max-w-2xl px-4 pt-3 space-y-4">
        <div className="sticky top-[60px] z-20 -mx-1 px-1 pt-1 pb-1">
          <WeekSelector
            selected={selected}
            onSelect={setSelected}
            availableDays={availableDays}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={ymd(selected)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            {mains.length > 0 && (
              <section className="space-y-2.5">
                <SectionHeader>{t("main_dishes")}</SectionHeader>
                <div className="space-y-2.5">
                  {mains.map((r, i) => (
                    <DishCard
                      key={r.id}
                      dish={r.dish}
                      price={r.price}
                      quantity={quantities[r.id] ?? 0}
                      onChange={(q) => setQuantities((p) => ({ ...p, [r.id]: q }))}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}

            {extras.length > 0 && (
              <section className="space-y-2.5">
                <SectionHeader>{t("extras")}</SectionHeader>
                <div className="space-y-2.5">
                  {extras.map((r, i) => (
                    <DishCard
                      key={r.id}
                      dish={r.dish}
                      price={r.price}
                      quantity={quantities[r.id] ?? 0}
                      onChange={(q) => setQuantities((p) => ({ ...p, [r.id]: q }))}
                      index={i + mains.length}
                    />
                  ))}
                </div>
              </section>
            )}

            {dayRows.length === 0 && (
              <div className="rounded-2xl bg-card border border-border px-5 py-10 text-center text-muted-foreground text-sm">
                {t("no_dishes")}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="rounded-2xl bg-card border border-border px-4 py-3">
          <label
            htmlFor="customer-name"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("customer_name")}
          </label>
          <input
            id="customer-name"
            name="customer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("customer_name_placeholder")}
            className="mt-1 w-full bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </main>

      <BottomBar total={total} itemCount={itemCount} onReserve={handleReserve} />
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}