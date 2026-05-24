import { useEffect, useState } from "react";
import { initI18n } from "@/lib/i18n";
import { getStoredTheme, applyTheme } from "@/lib/theme";

export function I18nBoot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const i = initI18n();
    const lang = i.language || "ar";
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
    applyTheme(getStoredTheme());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
