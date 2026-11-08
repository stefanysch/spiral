import { describe, expect, it } from "vitest";
import { sequenceSource } from "@/lib/random";
import {
  formatList, generateNumbers, MAX_QUANTITY, parseInteger, sortNumbers, validateOptions,
} from "./logic";

describe("parseInteger", () => {
  it("lê inteiros, inclusive negativos", () => {
    expect(parseInteger("10", "x")).toBe(10);
    expect(parseInteger(" -5 ", "x")).toBe(-5);
    expect(parseInteger("0", "x")).toBe(0);
  });
  it("recusa vazio, decimal, texto e notação científica", () => {
    for (const bad of ["", "  ", "1,5", "1.5", "abc", "1e3", "--1", "+"]) {
      expect(() => parseInteger(bad, "x"), `"${bad}"`).toThrow(/inteiro/);
    }
  });
  it("recusa número grande demais em vez de arredondar", () => {
    expect(() => parseInteger("99999999999999999999", "x")).toThrow(/grande demais/);
  });
});

describe("validateOptions", () => {
  const ok = { quantity: 5, min: 1, max: 10, unique: false };
  it("aceita opções válidas, inclusive min igual a max", () => {
    expect(() => validateOptions(ok)).not.toThrow();
    expect(() => validateOptions({ ...ok, min: 7, max: 7 })).not.toThrow();
  });
  it("recusa quantidade fora de 1 a 1000", () => {
    expect(() => validateOptions({ ...ok, quantity: 0 })).toThrow(/quantidade/);
    expect(() => validateOptions({ ...ok, quantity: MAX_QUANTITY + 1 })).toThrow(/quantidade/);
    expect(() => validateOptions({ ...ok, quantity: 1.5 })).toThrow(/quantidade/);
  });
  it("recusa mínimo maior que máximo", () => {
    expect(() => validateOptions({ ...ok, min: 10, max: 1 })).toThrow(/menor ou igual/);
  });
  it("recusa intervalo maior que 2^32", () => {
    expect(() => validateOptions({ ...ok, min: 0, max: 2 ** 32 })).toThrow(/grande demais/);
    expect(() => validateOptions({ ...ok, min: 0, max: 2 ** 32 - 1 })).not.toThrow();
    expect(() => validateOptions({ ...ok, min: -(2 ** 53), max: 2 ** 53 })).toThrow();
  });
  it("sem repetir, recusa pedir mais números do que existem", () => {
    expect(() => validateOptions({ quantity: 11, min: 1, max: 10, unique: true })).toThrow(/sem repetir/);
    expect(() => validateOptions({ quantity: 10, min: 1, max: 10, unique: true })).not.toThrow();
    expect(() => validateOptions({ quantity: 11, min: 1, max: 10, unique: false })).not.toThrow();
  });
});

describe("generateNumbers", () => {
  it("com repetição, usa a fonte e soma o mínimo", () => {
    // fonte fixa 3 e 7 em um intervalo de 10 números a partir de 1 → 4 e 8
    expect(generateNumbers({ quantity: 2, min: 1, max: 10, unique: false }, sequenceSource([3, 7]))).toEqual([4, 8]);
  });
  it("funciona com intervalo negativo e que cruza o zero", () => {
    expect(generateNumbers({ quantity: 3, min: -2, max: 2, unique: false }, sequenceSource([0, 2, 4]))).toEqual([-2, 0, 2]);
  });
  it("sem repetir, com fonte fixa, dá o resultado esperado", () => {
    expect(generateNumbers({ quantity: 3, min: 1, max: 5, unique: true }, sequenceSource([0, 0, 0]))).toEqual([1, 2, 3]);
    expect(generateNumbers({ quantity: 3, min: 1, max: 5, unique: true }, sequenceSource([4, 3, 0]))).toEqual([5, 1, 3]);
  });
  it("com repetição, a quantidade e os limites são respeitados", () => {
    const values = generateNumbers({ quantity: 500, min: -5, max: 20, unique: false });
    expect(values).toHaveLength(500);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(-5);
    expect(Math.max(...values)).toBeLessThanOrEqual(20);
  });
  it("com repetição, todos os números do intervalo aparecem em sorteios suficientes", () => {
    const seen = new Set(generateNumbers({ quantity: 1000, min: 1, max: 6, unique: false }));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("sem repetir, sorteando todos os números do intervalo, sai cada um uma vez só", () => {
    const values = generateNumbers({ quantity: 50, min: 1, max: 50, unique: true });
    expect([...values].sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
  });
  it("sem repetir, nunca repete e respeita os limites", () => {
    for (let round = 0; round < 50; round++) {
      const values = generateNumbers({ quantity: 30, min: -10, max: 30, unique: true });
      expect(new Set(values).size).toBe(30);
      expect(Math.min(...values)).toBeGreaterThanOrEqual(-10);
      expect(Math.max(...values)).toBeLessThanOrEqual(30);
    }
  });
  it("sem repetir funciona num intervalo gigante sem travar", () => {
    const values = generateNumbers({ quantity: 1000, min: 0, max: 2 ** 32 - 1, unique: true });
    expect(new Set(values).size).toBe(1000);
    expect(values.every((v) => Number.isInteger(v) && v >= 0 && v <= 2 ** 32 - 1)).toBe(true);
  });
  it("intervalo de um número só sempre devolve esse número", () => {
    expect(generateNumbers({ quantity: 4, min: 7, max: 7, unique: false })).toEqual([7, 7, 7, 7]);
  });
});

describe("sortNumbers", () => {
  it("ordena sem mexer na lista original", () => {
    const original = [3, -1, 10, 2];
    expect(sortNumbers(original, "crescente")).toEqual([-1, 2, 3, 10]);
    expect(sortNumbers(original, "decrescente")).toEqual([10, 3, 2, -1]);
    expect(sortNumbers(original, "sorteio")).toEqual([3, -1, 10, 2]);
    expect(original).toEqual([3, -1, 10, 2]);
  });
  it("compara como número, não como texto (10 vem depois de 9)", () => {
    expect(sortNumbers([10, 9, 100, 1], "crescente")).toEqual([1, 9, 10, 100]);
  });
});

describe("formatList", () => {
  it("separa por vírgula e espaço", () => {
    expect(formatList([4, 17, 9])).toBe("4, 17, 9");
  });
  it("um número só fica sem vírgula, lista vazia fica vazia", () => {
    expect(formatList([7])).toBe("7");
    expect(formatList([])).toBe("");
  });
  it("negativos e zero aparecem normalmente", () => {
    expect(formatList([-3, 0, 4])).toBe("-3, 0, 4");
  });
});