import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, ShoppingBag, Home } from "lucide-react";
import { useContext } from "react";
import { LangContext, ThemeContext } from "@/providers";

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const { lang, setLang } = useContext(LangContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-semibold"
      : "text-muted-foreground hover:text-foreground";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 h-14">
        {/* Logo / Home */}
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-tight">{t("site_title")}</span>
        </Link>

        {/* Nav + Controls */}
        <div className="flex items-center gap-3">
          <Link to="/my-orders" className={`text-xs ${isActive("/my-orders")}`}>
            <ShoppingBag className="h-4 w-4 inline mr-1" />
            {t("my_orders")}
          </Link>

          {/* Language Toggle */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="text-xs bg-transparent border border-border rounded-md px-1.5 py-0.5 focus:outline-none"
          >
            <option value="ar">AR</option>
            <option value="tr">TR</option>
            <option value="en">EN</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary transition"
            aria-label={t("dark_mode")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}