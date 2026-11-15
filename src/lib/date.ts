/**
 * contas básicas com datas, usadas por mais de uma ferramenta e pelo seletor de período.
 * uma data é um texto "aaaa-mm-dd" (o mesmo formato do campo de data do navegador).
 * por dentro, cada dia vira um número inteiro (dias desde 01/01/1970), então contar dias é só subtrair.
 * tudo em utc para o horário de verão e o fuso nunca mudarem uma conta.
 */

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

const MS_PER_DAY = 86_400_000;
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"] as const;

export function toDay(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < MIN_YEAR || y > MAX_YEAR) return null;
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date.getTime() / MS_PER_DAY;
}

export function fromDay(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

export function weekdayOf(day: number): number {
  return (((day + 4) % 7) + 7) % 7;
}

export const weekdayName = (day: number) => WEEKDAYS[weekdayOf(day)] ?? "";

export function formatDate(iso: string): string {
  const [y = "", m = "", d = ""] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function parseDateBr(text: string): string | null {
  const m = /^(\d{2})\/?(\d{2})\/?(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return toDay(iso) === null ? null : iso;
}

/** quantos dias tem o mês (month de 1 a 12) */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export const isWeekend = (day: number) => weekdayOf(day) === 0 || weekdayOf(day) === 6;

/** a data de hoje (no fuso do computador) como "aaaa-mm-dd" */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}