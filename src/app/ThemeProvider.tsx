import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "@/hooks/useTheme";

const KEY = "spiral:tema";

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "escuro" || saved === "claro") return saved;
  } catch {
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "escuro");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "escuro" ? "#0B0814" : "#FAF7FF");
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
        }
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "escuro" ? "claro" : "escuro"),
  }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
