import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ResultBox } from "@/components/ui/Result";
import { cn } from "@/lib/cn";
import { flipMany, formatResults, percent, tally, type Face } from "./logic";

/**
 * tela do cara ou coroa. ela só cuida da interface:
 * toda conta vem de ./logic.ts.
 */
export default function CaraOuCoroa() {
  const [times, setTimes] = useState("1");
  const [results, setResults] = useState<Face[]>([]);
  const [error, setError] = useState<string>();

  const count = Number(times);
  const last = results[results.length - 1];
  const score = tally(results);

  function play() {
    try {
      const flips = flipMany(count);
      setResults((prev) => [...prev, ...flips].slice(-1000)); // guarda no máximo as últimas 1000
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "não foi possível jogar.");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end">
        <div className="sm:w-48">
          <TextField label="quantas jogadas" type="number" inputMode="numeric" min={1} max={1000} mono
            value={times} onChange={(e) => setTimes(e.target.value)} error={error}
            onKeyDown={(e) => e.key === "Enter" && play()} />
        </div>
        <Button variant="primary" onClick={play}>{count > 1 ? `jogar ${count} vezes` : "jogar a moeda"}</Button>
        {results.length > 0 && <Button variant="ghost" onClick={() => setResults([])}>zerar</Button>}
      </div>

      <div aria-live="polite" className="grid place-items-center py-4">
        <div key={results.length} className={cn(
          "grid size-36 place-items-center rounded-full border-4 font-display text-3xl transition",
          last ? "border-accent text-accent" : "border-dashed border-border text-muted",
        )}>
          {last ?? "?"}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-center">
        {([["cara", score.cara], ["coroa", score.coroa], ["jogadas", score.total]] as const).map(([label, n]) => (
          <div key={label} className="rounded-md border border-border bg-surface-2 p-3">
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">{label}</dt>
            <dd className="font-mono text-2xl tabular-nums">{n}</dd>
            {label !== "jogadas" && <dd className="text-xs text-muted">{percent(n, score.total)}%</dd>}
          </div>
        ))}
      </dl>

      <ResultBox label="histórico" value={formatResults(results)} placeholder="jogue a moeda para começar." />
    </>
  );
}