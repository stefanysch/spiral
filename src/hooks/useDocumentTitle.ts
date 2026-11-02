import { useEffect } from "react";

/** muda o título da aba: "Cara ou coroa · spiral". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · spiral` : "spiral · ferramentas para dev";
  }, [title]);
}
