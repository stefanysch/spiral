import { describe, expect, it } from "vitest";
import {
  calculate, formatDecimalHours, formatOperation, formatOperationAuto, formatTime, needsSeconds,
  normalizeTime, parseTime, secondsInvolved, splitTrailingOperator, type Op,
} from "./logic";

describe("parseTime", () => {
  it("lê hh:mm e hh:mm:ss", () => {
    expect(parseTime("01:30")).toBe(5400);
    expect(parseTime("01:30:15")).toBe(5415);
    expect(parseTime(" 1:05 ")).toBe(3900);
  });
  it("aceita sinal negativo e positivo", () => {
    expect(parseTime("-00:11")).toBe(-660);
    expect(parseTime("+00:11")).toBe(660);
  });
  it("segundos e minutos vazios valem 0", () => {
    expect(parseTime("1:30:")).toBe(5400);
    expect(parseTime("2")).toBe(7200);
  });
  it("horas podem passar de 24", () => {
    expect(parseTime("27:15")).toBe(98100);
  });
  it("recusa minuto ou segundo acima de 59 e texto que não é horário", () => {
    expect(() => parseTime("1:75")).toThrow();
    expect(() => parseTime("1:30:60")).toThrow();
    expect(() => parseTime("abc")).toThrow();
    expect(() => parseTime("--1:00")).toThrow();
    expect(() => parseTime("")).toThrow();
  });
});

describe("normalizeTime", () => {
  it("só números: os 2 últimos dígitos são os minutos", () => {
    expect(normalizeTime("5")).toBe("00:05");
    expect(normalizeTime("15")).toBe("00:15");
    expect(normalizeTime("1530")).toBe("15:30");
    expect(normalizeTime("0015")).toBe("00:15");
    expect(normalizeTime("-11")).toBe("-00:11");
    expect(normalizeTime("+11")).toBe("+00:11");
    expect(normalizeTime("12345")).toBe("123:45");
  });
  it("com dois pontos, deixa como veio", () => {
    expect(normalizeTime("1:30")).toBe("1:30");
    expect(normalizeTime("01:30:15")).toBe("01:30:15");
  });
  it("minutos acima de 59 continuam dando erro depois", () => {
    expect(() => parseTime(normalizeTime("99"))).toThrow();
  });
});

describe("calculate", () => {
  it("soma e subtrai", () => {
    expect(calculate(5400, "+", "00:45").result).toBe(8100);
    expect(calculate(3600, "-", "02:30").result).toBe(-5400);
  });
  it("aceita valor negativo: somar negativo subtrai, subtrair negativo soma", () => {
    expect(calculate(3600, "+", "-00:30").result).toBe(1800);
    expect(calculate(3600, "-", "-00:30").result).toBe(5400);
    expect(calculate(-79800, "+", "+00:22").result).toBe(-78480); // -22:10 + 00:22 = -21:48
  });
  it("encadeia como no relatório de saldo", () => {
    const steps: Array<[Op, string]> = [["+", "00:15"], ["-", "00:54"], ["-", "01:08"], ["-", "03:55"], ["-", "07:49"]];
    let acc = parseTime("-00:11");
    const lines = steps.map(([op, b]) => {
      const o = calculate(acc, op, b);
      acc = o.result;
      return formatOperation(o, false);
    });
    expect(lines).toEqual([
      "-00:11 + 00:15 = 00:04",
      "00:04 - 00:54 = -00:50",
      "-00:50 - 01:08 = -01:58",
      "-01:58 - 03:55 = -05:53",
      "-05:53 - 07:49 = -13:42",
    ]);
  });
  it("os dois casos do saldo negativo", () => {
    const a = calculate(parseTime("00:20"), "-", "22:30");
    expect(formatOperation(a, false)).toBe("00:20 - 22:30 = -22:10");
    expect(formatOperation(calculate(a.result, "-", "00:22"), false)).toBe("-22:10 - 00:22 = -22:32");
    expect(formatOperation(calculate(a.result, "+", "00:22"), false)).toBe("-22:10 + 00:22 = -21:48");
  });
});

describe("precisão e limites", () => {
  it("recusa números grandes demais em vez de calcular errado", () => {
    expect(() => parseTime("99999999999999999999")).toThrow(/grande demais/);
    expect(() => calculate(Number.MAX_SAFE_INTEGER, "+", "01:00")).toThrow(/grande demais/);
    expect(() => calculate(-Number.MAX_SAFE_INTEGER, "-", "01:00")).toThrow(/grande demais/);
  });
  it("aguenta uma lista enorme de operações sem erro", () => {
    let acc = 0;
    for (let i = 0; i < 5000; i++) acc = calculate(acc, i % 2 === 0 ? "+" : "-", "00:01").result;
    expect(acc).toBe(0);
  });
});

describe("formatação", () => {
  it("hh:mm por padrão e hh:mm:ss quando pedido", () => {
    expect(formatTime(5400)).toBe("01:30");
    expect(formatTime(5415, true)).toBe("01:30:15");
    expect(formatTime(-3000)).toBe("-00:50");
    expect(formatTime(98100)).toBe("27:15");
    expect(formatTime(0)).toBe("00:00");
  });
  it("mostra segundos só quando a linha tem segundos", () => {
    expect(needsSeconds([5400, -660])).toBe(false);
    expect(needsSeconds([5400, 15])).toBe(true);
    const o = calculate(5400, "+", "00:00:15");
    expect(needsSeconds(secondsInvolved([o]))).toBe(true);
    expect(formatOperation(o, true)).toBe("01:30:00 + 00:00:15 = 01:30:15");
    expect(formatOperationAuto(calculate(5400, "+", "00:45"))).toBe("01:30 + 00:45 = 02:15");
    expect(formatOperationAuto(o)).toBe("01:30:00 + 00:00:15 = 01:30:15");
  });
  it("valor negativo aparece entre parênteses", () => {
    expect(formatOperation(calculate(3600, "+", "-00:30"), false)).toBe("01:00 + (-00:30) = 00:30");
    expect(formatOperation(calculate(3600, "-", "-00:30"), false)).toBe("01:00 - (-00:30) = 01:30");
  });
  it("horas decimais no jeito brasileiro", () => {
    expect(formatDecimalHours(8100)).toBe("2,25");
    expect(formatDecimalHours(-49320)).toBe("-13,7");
  });
});

describe("splitTrailingOperator", () => {
  it("separa o operador digitado no fim", () => {
    expect(splitTrailingOperator("01:30+")).toEqual({ value: "01:30", op: "+" });
    expect(splitTrailingOperator("00:54 -")).toEqual({ value: "00:54", op: "-" });
    expect(splitTrailingOperator("-")).toEqual({ value: "", op: "-" });
  });
  it("sem operador no fim, devolve null", () => {
    expect(splitTrailingOperator("01:30")).toBeNull();
    expect(splitTrailingOperator("-00:11")).toBeNull();
  });
});