import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CopyButton } from "./CopyButton";

type ResultBoxProps = {
  label: string;
  /** o texto do resultado; é ele que o botão copia */
  value: string;
  /** opcional: mostra algo diferente do valor copiado (ex.: valor formatado bonito) */
  children?: ReactNode;
  /** texto quando ainda não há resultado */
  placeholder?: string;
  mono?: boolean;
  large?: boolean;
};

/** área de resultado padrão: rótulo, valor e botão de copiar. todo resultado do site passa por aqui. */
export function ResultBox({ label, value, children, placeholder = "o resultado aparece aqui.", mono = true, large = false }: ResultBoxProps) {
  const empty = value === "";
  return (
    <section className="flex flex-col gap-2" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-sm font-medium tracking-normal">{label}</h2>
        {!empty && <CopyButton value={value} size="sm" />}
      </div>
      <output className={cn(
        "block min-h-12 break-words rounded-md border border-border bg-surface-2 px-3 py-2.5",
        mono && "font-mono", large && "text-2xl", empty && "text-muted",
      )}>
        {empty ? placeholder : children ?? value}
      </output>
    </section>
  );
}

type ResultListProps = {
  label: string;
  items: readonly string[];
  /** como juntar os itens no "copiar todos" */
  separator?: string;
  placeholder?: string;
};

/** lista de resultados (ex.: 10 CPFs): cada item com seu botão e um botão "copiar todos". */
export function ResultList({ label, items, separator = "\n", placeholder = "nada gerado ainda." }: ResultListProps) {
  return (
    <section className="flex flex-col gap-2" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-sm font-medium tracking-normal">
          {label} {items.length > 0 && <span className="text-muted">({items.length})</span>}
        </h2>
        {items.length > 1 && <CopyButton value={() => items.join(separator)} label="copiar todos" size="sm" />}
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted">{placeholder}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface-2">
          {items.map((item, i) => (
            <li key={`${i}-${item}`} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 break-all font-mono tabular-nums">{item}</span>
              <CopyButton value={item} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}