import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PASSWORD } from "@/config";
import { formatDate, ymd } from "@/lib/dateUtils";
import type { Lang } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return ymd(d);
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ name: string; qty: number }[]>([]);

  const load = async () => {
    const { data: ords } = await supabase
      .from("orders")
      .select("id, customer_name, created_at, items:order_items(quantity, dish:dishes(*))")
      .eq("order_date", date)
      .order("created_at", { ascending: false });
    setOrders(ords ?? []);
    const agg = new Map<string, number>();
    for (const o of ords ?? []) {
      for (const it of (o as any).items ?? []) {
        const d = it.dish;
        const name = lang === "ar" ? d.name_ar : lang === "tr" ? d.name_tr : d.name_en;
        agg.set(name, (agg.get(name) ?? 0) + it.quantity);
      }
    }
    setSummary(
      [...agg.entries()]
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
    );
  };

  useEffect(() => {
    if (authed) load();
  }, [authed, date, lang]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-md px-4 pt-12">
          <div className="rounded-2xl bg-card border border-border p-5">
            <label
              htmlFor="admin-password"
              className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t("admin_password")}
            </label>
            <input
              id="admin-password"
              name="admin-password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (pw === ADMIN_PASSWORD) setAuthed(true);
                  else toast.error(t("admin_wrong"));
                }
              }}
              className="mt-1 w-full bg-transparent text-[16px] focus:outline-none border-b border-border py-1"
            />
            <button
              onClick={() => {
                if (pw === ADMIN_PASSWORD) setAuthed(true);
                else toast.error(t("admin_wrong"));
              }}
              className="mt-5 w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold active:scale-95 transition"
            >
              {t("admin_login")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const dateObj = new Date(date + "T00:00:00");

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-5">
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <input
            type="date"
            id="admin-date"
            name="admin-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-transparent text-[15px] focus:outline-none"
          />
          <button
            onClick={load}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground px-1">
          {formatDate(dateObj, lang)}
        </div>

        <section className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t("admin_summary")}
          </div>
          {summary.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("admin_no_orders")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {summary.map((s) => (
                <li key={s.name} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[15px] font-medium text-foreground">{s.name}</span>
                  <span className="text-[15px] font-semibold tnum text-primary">×{s.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {orders.length > 0 && (
          <section className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("admin_details")}
            </div>
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{o.customer_name}</span>
                    <span className="text-xs text-muted-foreground tnum">
                      {new Date(o.created_at).toLocaleTimeString(
                        lang === "ar" ? "ar-EG" : lang === "tr" ? "tr-TR" : "en-US",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
                    {(o.items ?? []).map((it: any, i: number) => {
                      const n =
                        lang === "ar" ? it.dish.name_ar : lang === "tr" ? it.dish.name_tr : it.dish.name_en;
                      return <li key={i}>• {n} ×{it.quantity}</li>;
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}