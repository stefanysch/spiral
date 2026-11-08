import { describe, expect, it } from "vitest";
import { sequenceSource } from "@/lib/random";
import {
  characterSets, countCombinations, entropyBits, generatePassword, generatePasswords, log2BigInt, LOOKALIKES,
  MAX_LENGTH, MAX_PASSWORDS, MIN_LENGTH, parseWhole, SPECIAL, strengthOf, validateOptions,
  type PasswordOptions,
} from "./logic";

const all: PasswordOptions = {
  length: 16, count: 1, upper: true, lower: true, digits: true, special: true, avoidLookalikes: false,
};

describe("parseWhole", () => {
  it("lê inteiros positivos", () => {
    expect(parseWhole("16", "x")).toBe(16);
    expect(parseWhole(" 8 ", "x")).toBe(8);
  });
  it("recusa vazio, decimal, negativo e texto", () => {
    for (const bad of ["", " ", "1,5", "1.5", "-3", "abc", "1e2"]) {
      expect(() => parseWhole(bad, "x"), `"${bad}"`).toThrow(/inteiro/);
    }
  });
});

describe("characterSets", () => {
  it("usa só os grupos marcados, na ordem maiúsculas, minúsculas, números, especiais", () => {
    expect(characterSets(all)).toHaveLength(4);
    expect(characterSets({ ...all, upper: false, special: false })).toEqual(["abcdefghijklmnopqrstuvwxyz", "0123456789"]);
    expect(characterSets({ ...all, upper: false, lower: false, digits: false, special: false })).toEqual([]);
  });
  it("os caracteres especiais são exatamente os da lista pedida", () => {
    expect(SPECIAL).toBe("!@#$%&*()-+.,;?{[}]^><:");
    expect(characterSets({ ...all, upper: false, lower: false, digits: false })).toEqual([SPECIAL]);
  });
  it("evitar parecidos tira 0, O, 1, l e I e nada além disso", () => {
    const sets = characterSets({ ...all, avoidLookalikes: true });
    expect(sets.map((s) => s.length)).toEqual([24, 25, 8, 23]);
    for (const char of LOOKALIKES) expect(sets.join("").includes(char)).toBe(false);
  });
});

describe("validateOptions", () => {
  it("aceita opções válidas, nos limites também", () => {
    expect(() => validateOptions(all)).not.toThrow();
    expect(() => validateOptions({ ...all, length: MIN_LENGTH })).not.toThrow();
    expect(() => validateOptions({ ...all, length: MAX_LENGTH })).not.toThrow();
    expect(() => validateOptions({ ...all, count: MAX_PASSWORDS })).not.toThrow();
  });
  it("recusa tamanho fora do limite ou não inteiro", () => {
    for (const length of [0, MIN_LENGTH - 1, MAX_LENGTH + 1, 8.5, NaN]) {
      expect(() => validateOptions({ ...all, length }), `${length}`).toThrow(/tamanho/);
    }
  });
  it("recusa quantidade de senhas fora do limite", () => {
    expect(() => validateOptions({ ...all, count: 0 })).toThrow(/quantidade/);
    expect(() => validateOptions({ ...all, count: MAX_PASSWORDS + 1 })).toThrow(/quantidade/);
  });
  it("recusa nenhum tipo de caractere marcado", () => {
    expect(() => validateOptions({ ...all, upper: false, lower: false, digits: false, special: false }))
      .toThrow(/pelo menos um tipo/);
  });
});

describe("generatePassword", () => {
  it("com fonte fixa, escolhe os caracteres esperados", () => {
    expect(generatePassword({ ...all, length: 4 }, sequenceSource([0, 26, 52, 62]))).toBe("Aa0!");
  });
  it("descarta e sorteia de novo se faltar algum tipo marcado", () => {
    expect(generatePassword({ ...all, length: 4 }, sequenceSource([0, 0, 0, 0, 0, 26, 52, 62]))).toBe("Aa0!");
  });
  it("tem o tamanho pedido, só caracteres permitidos e pelo menos um de cada tipo marcado", () => {
    for (let mask = 1; mask < 16; mask++) {
      for (const avoidLookalikes of [false, true]) {
        for (const length of [MIN_LENGTH, 16, MAX_LENGTH]) {
          const options = {
            ...all, length, avoidLookalikes,
            upper: !!(mask & 1), lower: !!(mask & 2), digits: !!(mask & 4), special: !!(mask & 8),
          };
          const sets = characterSets(options);
          const pool = sets.join("");
          for (let n = 0; n < 5; n++) {
            const password = generatePassword(options);
            expect(password).toHaveLength(length);
            expect([...password].every((c) => pool.includes(c))).toBe(true);
            expect(sets.every((set) => [...password].some((c) => set.includes(c)))).toBe(true);
          }
        }
      }
    }
  });
  it("com evitar parecidos, nenhum caractere parecido aparece", () => {
    const options = { ...all, length: MAX_LENGTH, avoidLookalikes: true };
    for (let n = 0; n < 100; n++) {
      expect([...generatePassword(options)].some((c) => LOOKALIKES.includes(c))).toBe(false);
    }
  });
  it("senhas geradas em sequência são diferentes", () => {
    const passwords = generatePasswords({ ...all, count: MAX_PASSWORDS });
    expect(passwords).toHaveLength(MAX_PASSWORDS);
    expect(new Set(passwords).size).toBe(MAX_PASSWORDS);
  });
  it("recusa opções inválidas", () => {
    expect(() => generatePassword({ ...all, length: 2 })).toThrow(/tamanho/);
    expect(() => generatePasswords({ ...all, count: 0 })).toThrow(/quantidade/);
  });
});

describe("countCombinations", () => {
  it("bate com a conta feita à mão", () => {
    expect(countCombinations([2, 1], 2)).toBe(4n);
    expect(countCombinations([26], 10)).toBe(26n ** 10n);
  });
  it("bate com a contagem de todas as sequências, uma por uma", () => {
    const groups = [[0, 1], [2, 3], [4]]
    let expected = 0n;
    for (let n = 0; n < 5 ** 4; n++) {
      const symbols = [0, 1, 2, 3].map((i) => Math.floor(n / 5 ** i) % 5);
      if (groups.every((g) => symbols.some((s) => g.includes(s)))) expected++;
    }
    expect(countCombinations([2, 2, 1], 4)).toBe(expected);
  });
});

describe("log2BigInt", () => {
  it("é exato em potências de 2, pequenas ou enormes", () => {
    expect(log2BigInt(1n)).toBe(0);
    expect(log2BigInt(8n)).toBe(3);
    expect(log2BigInt(2n ** 100n)).toBe(100);
    expect(log2BigInt(2n ** 500n)).toBe(500);
  });
  it("tem a precisão de um número normal em valores gigantes", () => {
    expect(Math.abs(log2BigInt(3n * 2n ** 200n) - (200 + Math.log2(3)))).toBeLessThan(1e-12);
  });
  it("recusa zero e negativos", () => {
    expect(() => log2BigInt(0n)).toThrow();
    expect(() => log2BigInt(-5n)).toThrow();
  });
});

describe("entropyBits e strengthOf", () => {
  it("um grupo só: tamanho × log2(letras do grupo)", () => {
    const lowerOnly = { ...all, length: 10, upper: false, digits: false, special: false };
    expect(Math.abs(entropyBits(lowerOnly) - 10 * Math.log2(26))).toBeLessThan(1e-9);
  });
  it("todos os grupos em senha longa: bate com a conta independente, e fica abaixo do máximo possível", () => {
    const sizes = [26, 26, 10, 23];
    const missing = sizes.reduce((sum, size) => sum + ((85 - size) / 85) ** MAX_LENGTH, 0);
    const expected = MAX_LENGTH * Math.log2(85) + Math.log2(1 - missing);
    const bits = entropyBits({ ...all, length: MAX_LENGTH });
    expect(Math.abs(bits - expected)).toBeLessThan(1e-9);
    expect(bits).toBeLessThan(MAX_LENGTH * Math.log2(85));
  });
  it("exigir um de cada tipo reduz a entropia em senhas curtas", () => {
    const bits = entropyBits({ ...all, length: 4 });
    expect(bits).toBeLessThan(4 * Math.log2(85) - 3);
  });
  it("mais tamanho e mais tipos de caractere dão mais entropia", () => {
    expect(entropyBits({ ...all, length: 20 })).toBeGreaterThan(entropyBits({ ...all, length: 10 }));
    expect(entropyBits(all)).toBeGreaterThan(entropyBits({ ...all, special: false }));
  });
  it("recusa opções inválidas", () => {
    expect(() => entropyBits({ ...all, length: 2 })).toThrow(/tamanho/);
  });
  it("classifica a força nos limites de 40, 60 e 80 bits", () => {
    expect(strengthOf(0)).toBe("fraca");
    expect(strengthOf(39.99)).toBe("fraca");
    expect(strengthOf(40)).toBe("razoável");
    expect(strengthOf(59.99)).toBe("razoável");
    expect(strengthOf(60)).toBe("forte");
    expect(strengthOf(79.99)).toBe("forte");
    expect(strengthOf(80)).toBe("muito forte");
  });
});