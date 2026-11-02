import { describe, expect, it } from "vitest";
import { sequenceSource } from "@/lib/random";
import { charValue, checkDigit, formatCnpj, generateCnpj, generateCnpjs, isValidCnpj, withCheckDigits } from "./logic";

describe("charValue", () => {
  it("números valem eles mesmos e letras valem ASCII − 48", () => {
    expect(charValue("0")).toBe(0);
    expect(charValue("9")).toBe(9);
    expect(charValue("A")).toBe(17);
    expect(charValue("Z")).toBe(42);
  });
});

describe("checkDigit", () => {
  // exemplo oficial da Receita Federal para o CNPJ alfanumérico
  it("bate com o exemplo oficial 12.ABC.345/01DE-35", () => {
    expect(checkDigit("12ABC34501DE")).toBe(3);
    expect(checkDigit("12ABC34501DE3")).toBe(5);
  });

  // cnpj numérico válido clássico: 11.222.333/0001-81
  it("continua certo para CNPJ só de números", () => {
    expect(withCheckDigits("112223330001")).toBe("11222333000181");
  });
});

describe("generateCnpj", () => {
  it("numérico: com sorteio fixo, gera o esperado", () => {
    // raiz 11222333 + ordem 0001
    expect(generateCnpj("numerico", sequenceSource([1, 1, 2, 2, 2, 3, 3, 3]))).toBe("11222333000181");
  });

  it("numérico: descarta raiz com todos os dígitos iguais", () => {
    const source = sequenceSource([4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 2, 2, 2, 3, 3, 3]);
    expect(generateCnpj("numerico", source)).toBe("11222333000181");
  });

  it("alfanumérico: descarta raiz sem nenhuma letra", () => {
    // 36 caracteres possíveis: índices 0–9 são números, 10 = "A", 11 = "B"...
    // primeira raiz só com números (descartada), segunda com "A" e "B"
    const source = sequenceSource([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 1, 2, 3, 4, 5, 6]);
    const cnpj = generateCnpj("alfanumerico", source);
    expect(cnpj.slice(0, 12)).toBe("AB1234560001");
    expect(isValidCnpj(cnpj)).toBe(true);
  });

  it("todo CNPJ gerado de verdade é válido, nos dois formatos", () => {
    for (let i = 0; i < 500; i++) {
      const num = generateCnpj("numerico");
      const alfa = generateCnpj("alfanumerico");
      expect(num).toMatch(/^\d{8}0001\d{2}$/);
      expect(alfa).toMatch(/^[0-9A-Z]{8}0001\d{2}$/);
      expect(alfa).toMatch(/[A-Z]/);
      expect(isValidCnpj(num)).toBe(true);
      expect(isValidCnpj(alfa)).toBe(true);
    }
  });
});

describe("formatCnpj", () => {
  it("coloca a máscara nos dois formatos", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
  });
});

describe("isValidCnpj", () => {
  it("aceita com e sem máscara, e letra minúscula", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true);
    expect(isValidCnpj("12abc34501de35")).toBe(true);
  });

  it("recusa dígito errado, letra no dígito verificador e tudo igual", () => {
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
    expect(isValidCnpj("12.ABC.345/01DE-3A")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
  });
});

describe("generateCnpjs", () => {
  it("gera a quantidade pedida, sem repetir", () => {
    const list = generateCnpjs(40, "numerico");
    expect(list.length).toBe(40);
    expect(new Set(list).size).toBe(40);
  });

  it("misturado intercala numérico e alfanumérico", () => {
    const list = generateCnpjs(6, "misturado");
    const alfa = list.filter((c) => /[A-Z]/.test(c)).length;
    expect(alfa).toBe(3);
    expect(list[0]).toMatch(/^\d{14}$/);
    expect(list[1]).toMatch(/[A-Z]/);
  });

  it("recusa quantidades fora de 1 a 100", () => {
    expect(() => generateCnpjs(0, "numerico")).toThrow();
    expect(() => generateCnpjs(101, "numerico")).toThrow();
  });
});