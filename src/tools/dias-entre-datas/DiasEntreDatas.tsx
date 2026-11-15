import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { ResultBox } from "@/components/ui/Result";
import { PeriodPicker } from "@/components/ui/PeriodPicker";
import { formatDate, parseDateBr } from "@/lib/date";
import { countDays, nationalHolidays, summarize } from "./logic";

// bolinha no calendário nos feriados nacionais do ano mostrado
const holidayMarks = (year: number) => new Map(nationalHolidays(year, year).map((h) => [h.iso, `feriado: ${h.name}`]));

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const isComplete = (text: string) => text.length === 10;

export default function DiasEntreDatas() {
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [useHolidays, setUseHolidays] = useState(false);
  const [subtractText, setSubtractText] = useState("0");

  const start = parseDateBr(startText);
  const end = parseDateBr(endText);
  const onlyStart = start !== null && endText === ""; // só a inicial escolhida: já conta ela (1 dia)
  const count = start && (end || onlyStart) ? countDays(start, end ?? start) : null;

  const subtract = subtractText.trim() === "" ? 0 : /^\d+$/.test(subtractText.trim()) ? Number(subtractText) : NaN;
  const summary = count ? summarize(count, useHolidays, subtract) : null;

  const startError = isComplete(startText) && !start ? "essa data não existe." : undefined;
  const endError = isComplete(endText) && !end ? "essa data não existe." : undefined;
  let subtractError: string | undefined;
  if (Number.isNaN(subtract)) subtractError = "digite um número inteiro, como 2.";
  else if (count && !summary) subtractError = "são mais dias para tirar do que dias úteis no período.";

  const text = count && summary
    ? `de ${formatDate(count.from)} até ${formatDate(count.to)}: ${plural(summary.daysWithout, "dia corrido", "dias corridos")}, ${plural(summary.businessWithout, "dia útil", "dias úteis")}`
    : "";

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <PeriodPicker startText={startText} endText={endText} onStartText={setStartText} onEndText={setEndText}
          startError={startError} endError={endError} markedDays={holidayMarks} markedLabel="feriado nacional" />
        <p className="text-xs text-muted">digite as datas (só os números, as barras entram sozinhas) ou clique num campo e escolha no calendário. as duas datas entram na conta.</p>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <Checkbox checked={useHolidays} onChange={(e) => setUseHolidays(e.target.checked)}
            label="desconsiderar os feriados nacionais do período" />
          <div className="sm:w-64">
            <TextField label="outros dias para subtrair" mono type="number" inputMode="numeric" min={0} value={subtractText}
              hint="day off, ausência…" error={subtractError} onChange={(e) => setSubtractText(e.target.value)} />
          </div>
        </div>
      </div>

      {onlyStart && <Notice tone="info">só a data inicial por enquanto, então estou contando 1 dia. escolha a data final.</Notice>}
      {count?.swapped && <Notice tone="info">as datas estavam invertidas, então contei de {formatDate(count.from)} até {formatDate(count.to)}.</Notice>}

      <ResultBox label="resultado" value={text} mono={false} large placeholder="escolha a data inicial para começar.">
        {count && summary && (
          <span className="flex flex-wrap gap-x-4">
            <span>{plural(summary.daysWithout, "dia corrido. ", "dias corridos. ")}</span>
            <span>{plural(summary.businessWithout, "dia útil. ", "dias úteis. ")}</span>
          </span>
        )}
      </ResultBox>

      {count && summary && (
        <>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm">
            <dt className="text-muted">dias corridos (as duas datas entram)</dt><dd className="text-right font-mono">{count.totalDays}</dd>
            <dt className="text-muted">sábados e domingos</dt><dd className="text-right font-mono">{count.weekendDays}</dd>
            <dt className="text-muted">dias úteis (segunda a sexta)</dt><dd className="text-right font-mono">{count.businessDays}</dd>
            {useHolidays && <>
              <dt className="text-muted">feriados nacionais ({summary.holidayBusinessDays} em dias úteis)</dt>
              <dd className="text-right font-mono">− {summary.holidayDays}</dd>
            </>}
            {summary.subtract > 0 && <><dt className="text-muted">outros dias subtraídos</dt><dd className="text-right font-mono">− {summary.subtract}</dd></>}
            <dt className="font-medium">dias corridos no fim</dt><dd className="text-right font-mono font-medium">{summary.daysWithout}</dd>
            <dt className="font-medium">dias úteis no fim</dt><dd className="text-right font-mono font-medium">{summary.businessWithout}</dd>
          </dl>
          {useHolidays && summary.holidays.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted">ver os {summary.holidays.length} feriados considerados</summary>
              <ul className="mt-2 flex flex-col gap-1">
                {summary.holidays.map((h) => (
                  <li key={h.iso}><span className="font-mono">{formatDate(h.iso)}</span> · {h.name}</li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </>
  );
}