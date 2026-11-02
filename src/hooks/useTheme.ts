import { createContext, useContext } from "react";

export type Theme = "escuro" | "claro";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** lê e troca o tema em qualquer componente. precisa estar dentro do <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa ser usado dentro do <ThemeProvider>.");
  return ctx;
}