import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomBar } from "@/components/BottomBar";
import { DishCard } from "@/components/DishCard";
import { canModifyOrder, formatDate, ymd } from "@/lib/dateUtils";
import { buildWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp";
import type { Dish, Lang } from "@/lib/types";

interface LoadedOrder {
  id: string;
  customer_name: string;
  order_date: string;
  items: {
    id: string;
    quantity: number;
    dish: Dish;
    price: number;
    availability_id: string;
  }[];
}

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [name, setName] = useState("");
  const [order, setOrder] = useState<LoadedOrder | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const find = async () => {
    if (!name.trim()) {
      toast.error(t("enter_name"));
      return;
    }
    const today = ymd(new Date());
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, customer_name, order_date")
      .ilike("customer_name", name.trim())
      .gte("order_date", today)
      .order("order_date", { ascending: true })
      .limit(1);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!orders || orders.length === 0) {
      toast.error(t("no_orders_found"));
      setOrder(null);
      return;
    }
    const ord = orders[0];

    const { data: items } = await supabase
      .from("order_items")
      .select("id, quantity, dish:dishes(*)")
      .eq("order_id", ord.id);

    const dayKey = new Date(ord.order_date + "T00:00:00")
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const dishIds = (items ?? []).map((i: any) => i.dish.id);
    const { data: avail } = await supabase
      .from("dish_availability")
      .select("id, dish_id, price")
      .eq("day_of_week", dayKey)
      .in("dish_id", dishIds.length ? dishIds : ["00000000-0000-0000-0000-000000000000"]);

    const priceByDish = new Map<string, { id: string; price: number }>();
    for (const a of avail ?? [])
      priceByDish.set((a as any).dish_id, { id: (a as any).id, price: (a as any).price });

    const loaded: LoadedOrder = {
      id: ord.id,
      customer_name: ord.customer_name,
      order_date: ord.order_date,
      items: (items ?? []).map((it: any) => {
        const p = priceByDish.get(it.dish.id);
        return {
          id: it.id,
          quantity: it.quantity,
          dish: it.dish,
          price: p?.price ?? 0,
          availability_id: p?.id ?? "",
        };
      }),
    };
    setOrder(loaded);
    const q: Record<string, number> = {};
    for (const it of loaded.items) q[it.id] = it.quantity;
    setQuantities(q);
  };

  const orderDate = order ? new Date(order.order_date + "T00:00:00") : null;
  const canEdit = order ? canModifyOrder(order.order_date) : false;

  const items = order
    ? order.items
        .map((it) => ({ it, qty: quantities[it.id] ?? 0 }))
        .filter((x) => x.qty > 0)
    : [];
  const total = items.reduce((s, x) => s + x.it.price * x.qty, 0);
  const itemCount = items.reduce((s, x) => s + x.qty, 0);

  const update = async () => {
    if (!order || !canEdit) return;
    await supabase.from("order_items").delete().eq("order_id", order.id);
    if (items.length > 0) {
      await supabase.from("order_items").insert(
        items.map((x) => ({
          order_id: order.id,
          dish_id: x.it.dish.id,
          quantity: x.qty,
        }))
      );
    }
    const msg = buildWhatsAppMessage({
      customerName: order.customer_name,
      date: orderDate!,
      items: items.map((x) => ({
        name:
          lang === "ar"
            ? x.it.dish.name_ar
            : lang === "tr"
            ? x.it.dish.name_tr
            : x.it.dish.name_en,
        qty: x.qty,
        price: x.it.price,
      })),
      total,
      lang,
      variant: "update",
    });
    openWhatsApp(msg);
    toast.success(t("updated"));
  };

  const cancel = async () => {
    if (!order || !canEdit) return;
    if (!window.confirm(t("cancel_confirm"))) return;
    await supabase.from("orders").delete().eq("id", order.id);
    const msg = buildWhatsAppMessage({
      customerName: order.customer_name,
      date: orderDate!,
      items: [],
      total: 0,
      lang,
      variant: "cancel",
    });
    openWhatsApp(msg);
    toast.success(t("cancelled"));
    setOrder(null);
    setQuantities({});
  };

  return (
    <div className="min-h-screen bg-background pb-44">
      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-5">
        <div className="rounded-2xl bg-card border border-border px-4 py-3">
          <label
            htmlFor="search-name"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("customer_name")}
          </label>
          <input
            id="search-name"
            name="search-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("customer_name_placeholder")}
            className="mt-1 w-full bg-transparent text-[16px] focus:outline-none"
          />
          <button
            onClick={find}
            className="mt-3 w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold active:scale-95 transition"
          >
            {t("find_order")}
          </button>
        </div>

        {order && orderDate && (
          <>
            <div className="rounded-2xl bg-card border border-border px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("date_label")}
              </div>
              <div className="text-[15px] font-semibold tracking-tight mt-0.5">
                {formatDate(orderDate, lang)}
              </div>
              {!canEdit && (
                <div className="mt-2 text-xs text-destructive">{t("lock_warning")}</div>
              )}
            </div>

            <div className="space-y-2.5">
              {order.items.map((it, i) => (
                <DishCard
                  key={it.id}
                  dish={it.dish}
                  price={it.price}
                  quantity={quantities[it.id] ?? 0}
                  onChange={(q) =>
                    canEdit && setQuantities((p) => ({ ...p, [it.id]: q }))
                  }
                  index={i}
                />
              ))}
            </div>

            {canEdit && (
              <button
                onClick={cancel}
                className="w-full h-12 rounded-full border border-destructive/30 text-destructive font-semibold active:scale-95 transition"
              >
                {t("cancel_order")}
              </button>
            )}
          </>
        )}
      </main>

      {order && canEdit && (
        <BottomBar
          total={total}
          itemCount={itemCount}
          onReserve={update}
          label={t("update_order")}
        />
      )}
    </div>
  );
}