/**
 * dias entre duas datas: dias corridos, dias úteis, feriados nacionais e dias a subtrair.
 * as contas básicas de data (converter, dia da semana…) ficam em lib/date.ts.
 */
import { fromDay, isWeekend, MAX_YEAR, MIN_YEAR, toDay } from "@/lib/date";

export type Count = {
  from: string; // primeira data do período (depois de ajustar se vieram invertidas)
  to: string;
  swapped: boolean; // true se a data final era anterior à inicial e eu troquei
  totalDays: number; // dias corridos, contando a data inicial e a final
  weekendDays: number; // sábados e domingos no período
  businessDays: number; // segunda a sexta no período
};

/**
 * conta os dias da data inicial até a final, as duas incluídas (de 01 a 02 são 2 dias; mesma data = 1 dia).
 * devolve null se alguma data for inválida.
 */
export function countDays(start: string, end: string): Count | null {
  let a = toDay(start), b = toDay(end);
  if (a === null || b === null) return null;
  const swapped = b < a;
  if (swapped) [a, b] = [b, a];

  let weekendDays = 0;
  for (let day = a; day <= b; day++) if (isWeekend(day)) weekendDays++;
  const totalDays = b - a + 1;
  return { from: fromDay(a), to: fromDay(b), swapped, totalDays, weekendDays, businessDays: totalDays - weekendDays };
}

/** domingo de páscoa de um ano (algoritmo de meeus/jones/butcher), como número do dia */
export function easterDay(year: number): number {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = março, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toDay(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)!;
}

export type Holiday = { iso: string; name: string };

const FIXED_HOLIDAYS: readonly [string, string][] = [
  ["01-01", "confraternização universal"],
  ["04-21", "tiradentes"],
  ["05-01", "dia do trabalho"],
  ["09-07", "independência do brasil"],
  ["10-12", "nossa senhora aparecida"],
  ["11-02", "finados"],
  ["11-15", "proclamação da república"],
  ["12-25", "natal"],
];

/**
 * feriados nacionais do brasil entre dois anos: os fixos e a sexta-feira santa (2 dias antes da páscoa).
 * o dia da consciência negra (20/11) é feriado nacional desde 2024.
 * não entram os feriados estaduais e municipais, nem carnaval e corpus christi (ponto facultativo).
 */
export function nationalHolidays(fromYear: number, toYear: number): Holiday[] {
  const out: Holiday[] = [];
  for (let y = Math.max(fromYear, MIN_YEAR); y <= Math.min(toYear, MAX_YEAR); y++) {
    for (const [md, name] of FIXED_HOLIDAYS) out.push({ iso: `${y}-${md}`, name });
    if (y >= 2024) out.push({ iso: `${y}-11-20`, name: "consciência negra" });
    out.push({ iso: fromDay(easterDay(y) - 2), name: "sexta-feira santa" });
  }
  return out.sort((a, b) => (a.iso < b.iso ? -1 : 1));
}

export type Summary = {
  holidays: Holiday[]; // feriados nacionais considerados (dentro do período; vazio se a opção está desligada)
  holidayDays: number; // quantos feriados caem no período
  holidayBusinessDays: number; // desses, quantos caem de segunda a sexta
  subtract: number; // dias a mais que a pessoa quer tirar (day off, ausência…)
  daysWithout: number; // dias corridos depois de tirar tudo
  businessWithout: number; // dias úteis depois de tirar tudo
};

/**
 * tira da conta os feriados nacionais do período (se `useHolidays`) e `subtract` dias a mais.
 * - feriado sai dos dias corridos sempre; dos dias úteis só se cair de segunda a sexta
 *   (um feriado no domingo não tira nenhum dia útil).
 * - os `subtract` dias saem dos dias corridos e dos úteis (vale para dias de segunda a sexta).
 * devolve null se `subtract` não for um inteiro ≥ 0 ou se sobrar menos que zero dia útil.
 */
export function summarize(count: Count, useHolidays: boolean, subtract = 0): Summary | null {
  if (!Number.isInteger(subtract) || subtract < 0) return null;
  const holidays = useHolidays
    ? nationalHolidays(Number(count.from.slice(0, 4)), Number(count.to.slice(0, 4))).filter((h) => h.iso >= count.from && h.iso <= count.to)
    : [];
  const holidayDays = holidays.length;
  const holidayBusinessDays = holidays.filter((h) => !isWeekend(toDay(h.iso)!)).length;
  const daysWithout = count.totalDays - holidayDays - subtract;
  const businessWithout = count.businessDays - holidayBusinessDays - subtract;
  if (businessWithout < 0 || daysWithout < 0) return null;
  return { holidays, holidayDays, holidayBusinessDays, subtract, daysWithout, businessWithout };
}