import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { TextField } from "./Field";
import { cn } from "@/lib/cn";
import { daysInMonth, formatDate, MAX_YEAR, MIN_YEAR, parseDateBr, toDay, todayIso, weekdayOf } from "@/lib/date";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

const pad = (n: number) => String(n).padStart(2, "0");

/** vai colocando as barras enquanto a pessoa digita: 05112026 → 05/11/2026 */
function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
}

export type PeriodPickerProps = {
  startText: string;
  endText: string;
  onStartText: (text: string) => void;
  onEndText: (text: string) => void;
  startError?: string;
  endError?: string;
  startLabel?: string;
  endLabel?: string;
  /** dias para marcar com uma bolinha no calendário (ex.: feriados): devolve "aaaa-mm-dd" → nome, para o ano pedido */
  markedDays?: (year: number) => ReadonlyMap<string, string>;
  markedLabel?: string;
};

/**
 * escolha de período: dois campos que aceitam digitar (só os números; as barras entram sozinhas) e um
 * calendário que abre ao clicar num campo. no calendário: o 1º clique é a data inicial e o 2º é a final (que fecha o calendário).
 */
export function PeriodPicker({
  startText, endText, onStartText, onEndText, startError, endError,
  startLabel = "data inicial", endLabel = "data final", markedDays, markedLabel = "dia marcado",
}: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const t = todayIso();
    return { y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) };
  });
  const box = useRef<HTMLDivElement>(null);

  const start = parseDateBr(startText);
  const end = parseDateBr(endText);

  // fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // se a pessoa digita uma data, o calendário aberto vai para o mês dela
  useEffect(() => {
    if (open && start) setView({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) });
  }, [start]);
  useEffect(() => {
    if (open && end) setView({ y: Number(end.slice(0, 4)), m: Number(end.slice(5, 7)) });
  }, [end]); 

  function openCalendar() {
    if (open) return;
    const ref = start ?? end ?? todayIso();
    setView({ y: Number(ref.slice(0, 4)), m: Number(ref.slice(5, 7)) });
    setOpen(true);
  }

  function pick(iso: string) {
    if (!start || end) {
      // começando de novo: este clique é a data inicial
      onStartText(formatDate(iso));
      onEndText("");
    } else if (iso < start) {
      onStartText(formatDate(iso)); // clicou antes da inicial: vira a nova inicial
    } else {
      onEndText(formatDate(iso));
      setOpen(false);
    }
  }

  function move(months: number) {
    setView(({ y, m }) => {
      const index = y * 12 + (m - 1) + months;
      return { y: Math.floor(index / 12), m: (index % 12) + 1 };
    });
  }
  const canGo = (months: number) => {
    const y = Math.floor((view.y * 12 + (view.m - 1) + months) / 12);
    return y >= MIN_YEAR && y <= MAX_YEAR;
  };

  const marks = markedDays?.(view.y);
  const blanks = weekdayOf(toDay(`${view.y}-${pad(view.m)}-01`) ?? 0);
  const total = daysInMonth(view.y, view.m);
  const today = todayIso();

  return (
    <div ref={box} className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={startLabel} mono inputMode="numeric" placeholder="dd/mm/aaaa" value={startText} error={startError}
          onFocus={openCalendar} onClick={openCalendar} onChange={(e) => onStartText(maskDate(e.target.value))} />
        <TextField label={endLabel} mono inputMode="numeric" placeholder="dd/mm/aaaa" value={endText} error={endError}
          onFocus={openCalendar} onClick={openCalendar} onChange={(e) => onEndText(maskDate(e.target.value))} />
      </div>

      {open && (
        <div role="dialog" aria-label="calendário"
          className="absolute left-0 z-20 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-1">
            <Button variant="ghost" size="sm" aria-label="ano anterior" disabled={!canGo(-12)} onClick={() => move(-12)}>«</Button>
            <Button variant="ghost" size="sm" aria-label="mês anterior" disabled={!canGo(-1)} onClick={() => move(-1)}>‹</Button>
            <span className="flex-1 text-center text-sm font-medium">{MONTHS[view.m - 1]} de {view.y}</span>
            <Button variant="ghost" size="sm" aria-label="próximo mês" disabled={!canGo(1)} onClick={() => move(1)}>›</Button>
            <Button variant="ghost" size="sm" aria-label="próximo ano" disabled={!canGo(12)} onClick={() => move(12)}>»</Button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-muted" aria-hidden>
            {WEEK.map((w, i) => <span key={i} className="py-1">{w}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: total }, (_, i) => {
              const iso = `${view.y}-${pad(view.m)}-${pad(i + 1)}`;
              const edge = iso === start || iso === end;
              const inside = start !== null && end !== null && iso > start && iso < end;
              const mark = marks?.get(iso);
              return (
                <button key={iso} type="button" onClick={() => pick(iso)}
                  aria-label={`${formatDate(iso)}${mark ? `, ${mark}` : ""}`} aria-pressed={edge}
                  title={mark}
                  className={cn(
                    "relative h-9 text-sm transition hover:bg-accent/30 focus-visible:shadow-neon",
                    edge ? "rounded-md bg-accent text-accent-fg" : inside ? "bg-accent/15" : "rounded-md",
                    iso === today && !edge && "border border-accent/60",
                  )}>
                  {i + 1}
                  {mark && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-danger" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{markedDays && <><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-danger" />{markedLabel}</>}</span>
            <Button variant="ghost" size="sm" onClick={() => { onStartText(""); onEndText(""); }}>limpar</Button>
          </div>
        </div>
      )}
    </div>
  );
}