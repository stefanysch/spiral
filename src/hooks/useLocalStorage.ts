import { useEffect, useState } from "react";

/**
 * igual ao useState, mas lembra o valor no navegador (localStorage).
 * se o navegador bloquear o armazenamento, funciona normalmente, só não lembra.
 * usar para preferências: quantidade padrão, máscara ligada, etc.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const fullKey = `spiral:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      // armazenamento bloqueado: segue sem salvar
    }
  }, [fullKey, value]);

  return [value, setValue] as const;
}