import { describe, expect, it } from "vitest";
import { fromDay, toDay } from "@/lib/date";
import { countDays, easterDay, nationalHolidays, summarize } from "./logic";

describe("countDays (as duas datas entram na conta)", () => {
  it("de segunda a sexta são 5 dias, todos úteis", () => {
    const c = countDays("2026-11-02", "2026-11-06")!;
    expect(c.totalDays).toBe(5);
    expect(c.businessDays).toBe(5);
    expect(c.weekendDays).toBe(0);
  });
  it("fim de semana no meio: sex, sáb, dom, seg", () => {
    const c = countDays("2026-11-06", "2026-11-09")!;
    expect(c.totalDays).toBe(4);
    expect(c.weekendDays).toBe(2);
    expect(c.businessDays).toBe(2);
  });
  it("de 01 a 02 são 2 dias; a mesma data é 1 dia", () => {
    expect(countDays("2026-11-01", "2026-11-02")!.totalDays).toBe(2);
    expect(countDays("2026-11-12", "2026-11-12")!.totalDays).toBe(1);
  });
  it("só um sábado: 1 dia e nenhum útil", () => {
    const c = countDays("2026-11-14", "2026-11-14")!;
    expect(c.totalDays).toBe(1);
    expect(c.businessDays).toBe(0);
  });
  it("ano bissexto: de 28/02 a 01/03/2024 são 3 dias; em 2025 são 2", () => {
    expect(countDays("2024-02-28", "2024-03-01")!.totalDays).toBe(3);
    expect(countDays("2025-02-28", "2025-03-01")!.totalDays).toBe(2);
  });
  it("2026 inteiro: 365 dias, 104 de fim de semana e 261 úteis", () => {
    const c = countDays("2026-01-01", "2026-12-31")!;
    expect(c.totalDays).toBe(365);
    expect(c.weekendDays).toBe(104);
    expect(c.businessDays).toBe(261);
  });
  it("2024 (bissexto) inteiro: 366 dias, 104 de fim de semana e 262 úteis", () => {
    const c = countDays("2024-01-01", "2024-12-31")!;
    expect(c.totalDays).toBe(366);
    expect(c.weekendDays).toBe(104);
    expect(c.businessDays).toBe(262);
  });
  it("datas invertidas são trocadas e avisa", () => {
    const c = countDays("2026-11-06", "2026-11-02")!;
    expect(c.swapped).toBe(true);
    expect(c.from).toBe("2026-11-02");
    expect(c.totalDays).toBe(5);
    expect(countDays("2026-11-02", "2026-11-06")!.swapped).toBe(false);
  });
  it("data inválida → null", () => {
    expect(countDays("2026-02-30", "2026-03-05")).toBeNull();
    expect(countDays("2026-03-01", "")).toBeNull();
  });
  it("período enorme funciona: 1900 a 2200", () => {
    const c = countDays("1900-01-01", "2200-12-31")!;
    expect(c.totalDays).toBe(toDay("2200-12-31")! - toDay("1900-01-01")! + 1);
    expect(c.weekendDays + c.businessDays).toBe(c.totalDays);
  });
  it("dias corridos = fins de semana + úteis, sempre", () => {
    for (let i = 0; i < 400; i++) {
      const c = countDays(fromDay(20_000 + i * 3), fromDay(20_000 + i * 3 + i))!;
      expect(c.weekendDays + c.businessDays, `${i}`).toBe(c.totalDays);
    }
  });
});

describe("páscoa e feriados", () => {
  it("datas da páscoa conhecidas", () => {
    expect(fromDay(easterDay(2024))).toBe("2024-03-31");
    expect(fromDay(easterDay(2025))).toBe("2025-04-20");
    expect(fromDay(easterDay(2026))).toBe("2026-04-05");
    expect(fromDay(easterDay(2027))).toBe("2027-03-28");
    expect(fromDay(easterDay(2000))).toBe("2000-04-23");
    expect(fromDay(easterDay(2038))).toBe("2038-04-25");
  });
  it("feriados nacionais de 2026, com sexta-feira santa e consciência negra", () => {
    expect(nationalHolidays(2026, 2026).map((h) => h.iso)).toEqual([
      "2026-01-01", "2026-04-03", "2026-04-21", "2026-05-01", "2026-09-07",
      "2026-10-12", "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25",
    ]);
    expect(nationalHolidays(2026, 2026).find((h) => h.iso === "2026-04-03")?.name).toBe("sexta-feira santa");
  });
  it("antes de 2024 não tem 20/11", () => {
    expect(nationalHolidays(2023, 2023).map((h) => h.iso)).not.toContain("2023-11-20");
    expect(nationalHolidays(2023, 2023)).toHaveLength(9);
  });
  it("vários anos: em ordem e sem repetir", () => {
    const h = nationalHolidays(2025, 2027).map((x) => x.iso);
    expect(h).toEqual([...h].sort());
    expect(new Set(h).size).toBe(h.length);
    expect(h).toHaveLength(30);
  });
});

describe("summarize", () => {
  const year = countDays("2026-01-01", "2026-12-31")!; // 365 dias, 261 úteis
  it("sem nada para tirar, nada muda", () => {
    const s = summarize(year, false, 0)!;
    expect(s.daysWithout).toBe(365);
    expect(s.businessWithout).toBe(261);
    expect(s.holidays).toEqual([]);
  });
  it("com feriados nacionais: 2026 tem 10 feriados, 9 em dias úteis (15/11 é domingo)", () => {
    const s = summarize(year, true, 0)!;
    expect(s.holidayDays).toBe(10);
    expect(s.holidayBusinessDays).toBe(9);
    expect(s.daysWithout).toBe(355);
    expect(s.businessWithout).toBe(252);
  });
  it("só conta os feriados que estão dentro do período", () => {
    const nov = countDays("2026-11-01", "2026-11-30")!;
    const s = summarize(nov, true, 0)!;
    expect(s.holidays.map((h) => h.iso)).toEqual(["2026-11-02", "2026-11-15", "2026-11-20"]);
    // novembro de 2026: 30 dias, 9 de fim de semana, 21 úteis; feriados: 2 úteis (02 e 20) e 1 domingo (15)
    expect(nov.businessDays).toBe(21);
    expect(s.daysWithout).toBe(27);
    expect(s.businessWithout).toBe(19);
  });
  it("as duas pontas entram: feriado na data inicial e na final contam", () => {
    const s = summarize(countDays("2026-11-02", "2026-11-20")!, true, 0)!;
    expect(s.holidayDays).toBe(3);
  });
  it("dias a mais (day off) saem dos corridos e dos úteis", () => {
    const s = summarize(year, true, 3)!;
    expect(s.daysWithout).toBe(352);
    expect(s.businessWithout).toBe(249);
    expect(s.subtract).toBe(3);
  });
  it("só os dias a mais, sem feriados", () => {
    const s = summarize(countDays("2026-11-02", "2026-11-08")!, false, 2)!; // seg a dom
    expect(s.daysWithout).toBe(5);
    expect(s.businessWithout).toBe(3);
  });
  it("recusa: negativo, decimal ou mais do que os dias úteis que sobram", () => {
    const week = countDays("2026-11-02", "2026-11-08")!; // 7 dias, 5 úteis
    expect(summarize(week, false, -1)).toBeNull();
    expect(summarize(week, false, 1.5)).toBeNull();
    expect(summarize(week, false, NaN)).toBeNull();
    expect(summarize(week, false, 5)!.businessWithout).toBe(0);
    expect(summarize(week, false, 6)).toBeNull();
    // 2 feriados úteis + 4 = 6 > 5 úteis
    const holWeek = countDays("2026-04-20", "2026-04-24")!; // 21/04 (terça) é feriado: 4 úteis restam
    expect(summarize(holWeek, true, 4)!.businessWithout).toBe(0);
    expect(summarize(holWeek, true, 5)).toBeNull();
  });
});