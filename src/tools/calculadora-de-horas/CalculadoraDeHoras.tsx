import { useRef, useState, type KeyboardEvent } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import {
  calculate, formatDecimalHours, formatOperationAuto, formatTime, needsSeconds,
  normalizeTime, parseTime, secondsInvolved, splitTrailingOperator, type Op, type Operation,
} from "./logic";
 
/**
 * calculadora de horas só com soma e subtração.
 * digite um horário (o primeiro pode ser negativo, como -00:11), aperte + ou - e continue.
 * depois do primeiro valor, + e - são sempre a operação: o último que você apertar é o que vale.
 * cada operação feita vira uma linha no histórico: "-00:11 + 00:15 = 00:04".
 */
export default function CalculadoraDeHoras() {
  const [ops, setOps] = useLocalStorage<Operation[]>("calculadora-de-horas:operacoes", []);
  // valor acumulado: começa do último resultado salvo, se houver
  const [acc, setAcc] = useState<number | null>(() => ops.at(-1)?.result ?? null);
  // operação da próxima entrada. com saldo na tela, o padrão é somar (valor negativo subtrai)
  const [pending, setPending] = useState<Op | null>(() => (ops.length > 0 ? "+" : null));
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
 
  const withSeconds = needsSeconds([...secondsInvolved(ops), acc ?? 0]);
  // só um "-" ou "+" no campo é o sinal do próximo valor, ainda sem número
  const hasNumber = /\d/.test(input);
  // prévia de como os números soltos serão entendidos: "1530" → "15:30"
  const preview = /^[+-]?\d+$/.test(input) ? normalizeTime(input) : null;
 
  /** fecha o valor digitado: calcula (se já há conta em andamento) e guarda a próxima operação. */
  function commit(raw: string, nextOp: Op | null) {
    const value = normalizeTime(raw); // "1530" → "15:30"
    try {
      if (acc === null || pending === null) {
        setAcc(parseTime(value)); // começa uma conta nova com este valor
      } else {
        const done = calculate(acc, pending, value);
        setOps((prev) => [...prev, done]);
        setAcc(done.result);
      }
      setPending(nextOp ?? "+"); // depois do enter o saldo continua valendo
      setInput("");
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "conta inválida.");
      setInput(raw);
    }
    inputRef.current?.focus();
  }
 
  function handleChange(typed: string) {
    setError(undefined);
    const text = typed.replace(/[^\d:+\- ]/g, ""); // só números, ":", "+" e "-"
    const split = splitTrailingOperator(text);
    if (!split) return setInput(text);
    if (split.value.trim() === "") {
      // campo vazio e já existe total: o último operador digitado vale (+ depois de - vira +, e vice-versa).
      // assim "- -" não vira menos com menos (que somaria) e "- +" não mantém o menos antigo.
      if (acc !== null) {
        setPending(split.op);
        return setInput("");
      }
      // ainda sem total: o sinal é do primeiro valor ("-0011" começa negativo)
      return setInput(split.op);
    }
    if (/^[+-]$/.test(split.value.trim())) return; // "-+": ignora o segundo sinal
    commit(split.value, split.op);
  }
 
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      if (hasNumber) commit(input, null);
    }
    if (e.key === "Escape") clear();
  }
 
  function clear() {
    setOps([]);
    setAcc(null);
    setPending(null);
    setInput("");
    setError(undefined);
    inputRef.current?.focus();
  }
 
  const lines = ops.map(formatOperationAuto);
 
  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        {/* visor: o que já está na conta + o campo para o próximo valor */}
        <div className="flex flex-col gap-1">
          <p className="min-h-5 text-right font-mono text-sm text-muted" aria-live="polite">
            {acc !== null && `${formatTime(acc, withSeconds)} ${pending ?? "+"}`}
          </p>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="00:00"
            aria-label="valor"
            aria-invalid={!!error || undefined}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            className={cn("h-14 w-full rounded-md border bg-bg px-4 text-right font-mono text-3xl text-fg placeholder:text-muted/40",
              error ? "border-danger" : "border-border")}
          />
          {preview && !error && <p className="text-right font-mono text-sm text-muted">= {preview}</p>}
          {error && <p role="alert" className="text-right text-sm text-danger">{error}</p>}
        </div>
 
        {/* sem botões: tudo pelo teclado (+ - enter esc). a linha abaixo diz o que digitar agora */}
        <p className="text-center text-sm text-muted">
          {acc === null
            ? "digite um horário, como 0130 ou 01:30. use - antes do número para começar negativo."
            : "digite + ou - e o próximo horário. enter calcula, esc limpa tudo."}
        </p>
      </div>
 
      <section aria-label="histórico" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-sm font-medium tracking-normal">histórico</h2>
          {lines.length > 0 && <CopyButton value={() => lines.join("\n")} label="copiar tudo" size="sm" />}
        </div>
        {lines.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted">
            cada operação aparece aqui. ex.: digite <span className="font-mono text-fg">-0011</span>, aperte{" "}
            <span className="font-mono text-fg">+</span>, digite <span className="font-mono text-fg">0015</span> e aperte{" "}
            <span className="font-mono text-fg">enter</span>. para começar com um valor negativo, digite{" "}
            <span className="font-mono text-fg">-</span> antes do primeiro número.
          </p>
        ) : (
          <ol className="rounded-md border border-border bg-bg px-4 py-3 font-mono text-sm leading-7 tabular-nums">
            {lines.map((line, i) => <li key={i}>{line}</li>)}
          </ol>
        )}
      </section>
 
      {acc !== null && (
        <section aria-label="total" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted">total</span>
            <output className={cn("font-mono text-2xl tabular-nums", acc < 0 ? "text-warn" : "text-fg")}>
              {formatTime(acc, withSeconds)}
            </output>
            <span className="font-mono text-sm text-muted">{formatDecimalHours(acc)} h</span>
          </div>
          <CopyButton value={formatTime(acc, withSeconds)} size="sm" />
        </section>
      )}
    </>
  );
}
