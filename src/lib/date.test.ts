import { describe, expect, it } from "vitest";
import { daysInMonth, formatDate, fromDay, isWeekend, parseDateBr, toDay, todayIso, weekdayName } from "./date";

describe("toDay / fromDay", () => {
  it("01/01/1970 é o dia 0 e ida e volta fecha", () => {
    expect(toDay("1970-01-01")).toBe(0);
    expect(toDay("1970-01-02")).toBe(1);
    for (const iso of ["1900-01-01", "2000-02-29", "2024-02-29", "2026-11-12", "2200-12-31"]) {
      expect(fromDay(toDay(iso)!)).toBe(iso);
    }
  });
  it("recusa data que não existe ou fora do formato", () => {
    for (const bad of ["", "2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10", "2026-1-1", "26-01-01", "1899-12-31", "2201-01-01", "abc"]) {
      expect(toDay(bad), bad).toBeNull();
    }
  });
  it("2000 e 2024 são bissextos, 1900 e 2100 não", () => {
    expect(toDay("2000-02-29")).not.toBeNull();
    expect(toDay("2024-02-29")).not.toBeNull();
    expect(toDay("1900-02-29")).toBeNull();
    expect(toDay("2100-02-29")).toBeNull();
  });
});

describe("dia da semana", () => {
  it("datas conhecidas", () => {
    expect(weekdayName(toDay("1970-01-01")!)).toBe("quinta");
    expect(weekdayName(toDay("2000-01-01")!)).toBe("sábado");
    expect(weekdayName(toDay("2024-02-29")!)).toBe("quinta");
    expect(weekdayName(toDay("2026-11-12")!)).toBe("quinta");
  });
});

describe("formatDate", () => {
  it("aaaa-mm-dd → dd/mm/aaaa", () => expect(formatDate("2026-11-05")).toBe("05/11/2026"));
});

describe("parseDateBr / daysInMonth", () => {
  it("dd/mm/aaaa e só os números", () => {
    expect(parseDateBr("05/11/2026")).toBe("2026-11-05");
    expect(parseDateBr("05112026")).toBe("2026-11-05");
    expect(parseDateBr(" 29/02/2024 ")).toBe("2024-02-29");
  });
  it("recusa data que não existe ou incompleta", () => {
    for (const bad of ["", "5/11/2026", "30/02/2026", "29/02/2025", "32/01/2026", "00/01/2026", "05/13/2026", "05/11/26", "05/11/", "aa/bb/cccc"]) {
      expect(parseDateBr(bad), bad).toBeNull();
    }
  });
  it("dias de cada mês, com bissexto", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});


describe("isWeekend / todayIso", () => {
  it("sábado e domingo", () => {
    expect(isWeekend(toDay("2026-11-14")!)).toBe(true); // sábado
    expect(isWeekend(toDay("2026-11-15")!)).toBe(true); // domingo
    expect(isWeekend(toDay("2026-11-16")!)).toBe(false); // segunda
  });
  it("hoje tem o formato aaaa-mm-dd e é uma data que existe", () => {
    expect(toDay(todayIso())).not.toBeNull();
  });
});