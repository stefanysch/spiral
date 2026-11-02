import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type CopyButtonProps = {
  /** o texto a copiar (ou uma função que monta o texto na hora do clique) */
  value: string | (() => string);
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

type State = "idle" | "copied" | "manual";

/**
 * botão de copiar com feedback.
 * - deu certo: mostra "Copiado!" por 2 segundos
 * - falhou: abre um campo com o texto já selecionado, para copiar com Ctrl+C
 */
export function CopyButton({ value, label = "copiar", size = "md", className }: CopyButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [manualText, setManualText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (state === "manual") inputRef.current?.select();
  }, [state]);

  async function handleClick() {
    const text = typeof value === "function" ? value() : value;
    if (!text) return;
    const ok = await copyText(text);
    window.clearTimeout(timer.current);
    if (ok) {
      setState("copied");
      timer.current = window.setTimeout(() => setState("idle"), 2000);
    } else {
      setManualText(text);
      setState("manual");
    }
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <button type="button" onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border font-medium transition",
          size === "md" ? "min-h-9 px-3 text-sm" : "min-h-7 px-2 text-xs",
          state === "copied"
            ? "border-accent bg-accent text-accent-fg"
            : "border-border bg-surface-2 text-fg hover:border-accent",
        )}>
        <Icon name={state === "copied" ? "check" : "copy"} size={size === "md" ? 16 : 14} />
        <span aria-live="polite">{state === "copied" ? "Copiado!" : label}</span>
      </button>

      {state === "manual" && (
        <span className="absolute right-0 top-full z-10 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-md border border-border bg-surface p-3 text-xs shadow-lg">
          <span className="text-muted">não deu para copiar sozinho. o texto está selecionado: use ctrl+c (ou cmd+c).</span>
          <input ref={inputRef} readOnly value={manualText} onFocus={(e) => e.currentTarget.select()}
            className="rounded border border-border bg-bg px-2 py-1.5 font-mono text-fg" aria-label="texto para copiar" />
          <button type="button" onClick={() => setState("idle")} className="self-end text-muted hover:text-fg">
            fechar
          </button>
        </span>
      )}
    </span>
  );
}