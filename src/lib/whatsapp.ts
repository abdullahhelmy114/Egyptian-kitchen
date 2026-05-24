import { WHATSAPP_NUMBER } from "@/config";
import type { Lang } from "./types";
import { formatDate } from "./dateUtils";

export interface MessageLine {
  name: string;
  qty: number;
  price: number;
}

interface BuildMessageInput {
  customerName: string;
  date: Date;
  items: MessageLine[];
  total: number;
  lang: Lang;
  variant?: "new" | "update" | "cancel";
}

const TR = {
  ar: {
    newPrefix: "*طلب جديد من:*",
    updatePrefix: "*تحديث طلب من:*",
    cancelText: "*إلغاء طلب بتاريخ*",
    date: "*التاريخ:*",
    items: "*الأطباق:*",
    total: "*المجموع:*",
    currency: "ل.ت",
  },
  tr: {
    newPrefix: "*Yeni sipariş:*",
    updatePrefix: "*Güncellenen sipariş:*",
    cancelText: "*İptal edilen sipariş, tarih:*",
    date: "*Tarih:*",
    items: "*Yemekler:*",
    total: "*Toplam:*",
    currency: "TL",
  },
  en: {
    newPrefix: "*New order from:*",
    updatePrefix: "*Updated order from:*",
    cancelText: "*Cancelled order for:*",
    date: "*Date:*",
    items: "*Items:*",
    total: "*Total:*",
    currency: "TL",
  },
};

export function buildWhatsAppMessage(input: BuildMessageInput): string {
  const t = TR[input.lang];
  const dateStr = formatDate(input.date, input.lang);
  if (input.variant === "cancel") {
    return `${t.cancelText} ${dateStr}\n${input.customerName ? `${t.newPrefix.replace("*", "").replace("*", "")} ${input.customerName}` : ""}`.trim();
  }
  const prefix = input.variant === "update" ? t.updatePrefix : t.newPrefix;
  const lines = input.items
    .map((it) => `• ${it.name} ×${it.qty}  (${it.price * it.qty} ${t.currency})`)
    .join("\n");
  return [
    `${prefix} ${input.customerName}`,
    `${t.date} ${dateStr}`,
    "",
    t.items,
    lines,
    "",
    `${t.total} ${input.total} ${t.currency}`,
  ].join("\n");
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
