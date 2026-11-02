/**
 * regra de ouro: todo horário vira segundos inteiros antes de qualquer conta.
 * "01:30" = 5400 segundos. somar inteiros nunca dá erro de arredondamento.
 * só no final viramos texto de novo.
 */

export type Op = "+" | "-";

export class CalcError extends Error {}

/** garante que a conta cabe em inteiros exatos (acima disso o computador começa a arredondar). */
function ensureSafe(n: number): number {
  if (!Number.isSafeInteger(n)) throw new CalcError("número grande demais para calcular com precisão.");
  return n;
}

/**
 * lê um horário. aceita "1", "1:30", "01:30:15", "1:30:" e também com sinal: "-00:11" ou "+00:11".
 * minutos e segundos vazios valem 0. horas não têm limite (pode passar de 24).
 */
export function parseTime(text: string): number {
  const clean = text.trim();
  const match = /^([+-]?)(\d+)(?::(\d{0,2}))?(?::(\d{0,2}))?$/.exec(clean);
  if (!match) throw new CalcError(`"${clean}" não é um horário. use hh:mm ou hh:mm:ss, como 01:30.`);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  if (minutes > 59) throw new CalcError(`minutos vão de 00 a 59 (recebi ${match[3]}).`);
  if (seconds > 59) throw new CalcError(`segundos vão de 00 a 59 (recebi ${match[4]}).`);
  const total = ensureSafe(Number(match[2]) * 3600 + minutes * 60 + seconds);
  return match[1] === "-" ? -total : total;
}

/**
 * deixa digitar horário sem os dois pontos. só números: os 2 últimos dígitos são os minutos
 * e o resto são as horas. "15" → "00:15", "1530" → "15:30", "-11" → "-00:11".
 * se já tiver ":" (ou não for só número), devolve do jeito que veio.
 */
export function normalizeTime(text: string): string {
  const match = /^([+-]?)(\d+)$/.exec(text.trim());
  if (!match) return text;
  const digits = (match[2] ?? "").padStart(3, "0");
  return `${match[1]}${digits.slice(0, -2).padStart(2, "0")}:${digits.slice(-2)}`;
}

/** uma operação feita: "a op b = result". é uma linha do histórico. */
export type Operation = {
  a: number;       // segundos
  op: Op;
  b: string;       // como a pessoa digitou (pode ter sinal)
  result: number;  // segundos
};

/** faz uma operação: soma ou subtrai o horário b (que pode ser negativo) de a. */
export function calculate(a: number, op: Op, b: string): Operation {
  const value = parseTime(b);
  const result = op === "+" ? a + value : a - value;
  return { a, op, b, result: ensureSafe(result) };
}

/**
 * formata segundos como horário.
 * withSeconds = false → "-00:50"; true → "-00:50:00".
 * horas não viram dias: 98100 s → "27:15".
 */
export function formatTime(seconds: number, withSeconds = false): string {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hhmm = `${sign}${pad(Math.floor(abs / 3600))}:${pad(Math.floor((abs % 3600) / 60))}`;
  return withSeconds ? `${hhmm}:${pad(abs % 60)}` : hhmm;
}

/** algum valor da lista tem segundos diferentes de zero? */
export function needsSeconds(values: readonly number[]): boolean {
  return values.some((v) => v % 60 !== 0);
}

/** o segundo valor como aparece na linha; negativo vai entre parênteses: "(-00:22)". */
export function formatOperand(b: string, withSeconds: boolean): string {
  const seconds = parseTime(b);
  const text = formatTime(seconds, withSeconds);
  return seconds < 0 ? `(${text})` : text;
}

/** uma linha do histórico: "-00:11 + 00:15 = 00:04". */
export function formatOperation(o: Operation, withSeconds: boolean): string {
  return `${formatTime(o.a, withSeconds)} ${o.op} ${formatOperand(o.b, withSeconds)} = ${formatTime(o.result, withSeconds)}`;
}

/** todos os segundos envolvidos nas operações (para decidir se mostra segundos). */
export function secondsInvolved(ops: readonly Operation[]): number[] {
  return ops.flatMap((o) => [o.a, o.result, parseTime(o.b)]);
}

/** uma linha com segundos só se ela tem segundos; as outras continuam em hh:mm. */
export function formatOperationAuto(o: Operation): string {
  return formatOperation(o, needsSeconds(secondsInvolved([o])));
}

/** horas com casas decimais, no jeito brasileiro: 8100 s → "2,25". útil para folha de horas. */
export function formatDecimalHours(seconds: number): string {
  const value = Math.round((seconds * 10000) / 3600) / 10000;
  return String(value).replace(".", ",");
}

/**
 * detecta um + ou - digitado no fim do campo: "01:30+" → valor "01:30", operação "+".
 * um campo que é só o operador ("-") devolve valor vazio.
 */
export function splitTrailingOperator(text: string): { value: string; op: Op } | null {
  const match = /^(.*?)\s*([+-])$/.exec(text);
  if (!match) return null;
  return { value: match[1]!, op: match[2] as Op };
}