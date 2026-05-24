import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Moon, Sun, ShoppingBag, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";
import type { Lang } from "@/lib/types";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "عربي" },
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "EN" },
];

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
  };

  const changeLang = (code: Lang) => {
    i18n.changeLanguage(code);
    if (typeof document !== "undefined") {
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = code;
    }
  };

  const currentLang = i18n.language as Lang;
  const isOrdersPage = location.pathname === "/my-orders";

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--gold)] text-white font-semibold">
            ك
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">
              {t("site_title")}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("tagline")}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            to={isOrdersPage ? "/" : "/my-orders"}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-secondary transition"
            aria-label={isOrdersPage ? t("home") : t("my_orders")}
          >
            {isOrdersPage ? <Home className="h-[18px] w-[18px]" /> : <ShoppingBag className="h-[18px] w-[18px]" />}
          </Link>
          <button
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-secondary transition"
            aria-label={theme === "dark" ? t("light_mode") : t("dark_mode")}
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
          <div className="ml-1 flex h-9 items-center rounded-full bg-secondary p-0.5">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className={`h-8 px-2.5 rounded-full text-xs font-medium transition ${
                  currentLang === l.code
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
