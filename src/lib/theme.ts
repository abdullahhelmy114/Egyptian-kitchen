export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setStoredTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}
