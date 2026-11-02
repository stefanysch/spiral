import { describe, expect, it } from "vitest";
import { sequenceSource } from "@/lib/random";
import { checkDigit, formatCpf, generateCpf, generateCpfs, isValidCpf } from "./logic";
 
describe("checkDigit", () => {
  // conta feita à mão: 529.982.247-25 é um cpf válido conhecido
  it("calcula os dois dígitos de um CPF conhecido", () => {
    expect(checkDigit([5, 2, 9, 9, 8, 2, 2, 4, 7])).toBe(2);
    expect(checkDigit([5, 2, 9, 9, 8, 2, 2, 4, 7, 2])).toBe(5);
  });
 
  it("resto menor que 2 vira dígito 0", () => {
    // 1·10 + 2·9 + ... + 9·2 = 210, e 210 % 11 = 1
    expect(checkDigit([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(0);
  });
});
 
describe("generateCpf", () => {
  it("com sorteio fixo, gera o CPF esperado", () => {
    expect(generateCpf(sequenceSource([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toBe("12345678909");
  });
 
  it("descarta bases com todos os dígitos iguais", () => {
    // primeiro sorteia 555555555 (descartado), depois 123456789
    const source = sequenceSource([5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(generateCpf(source)).toBe("12345678909");
  });
 
  it("todo CPF gerado de verdade é válido", () => {
    for (let i = 0; i < 1000; i++) {
      const cpf = generateCpf();
      expect(cpf).toMatch(/^\d{11}$/);
      expect(isValidCpf(cpf)).toBe(true);
    }
  });
});
 
describe("formatCpf", () => {
  it("coloca pontos e traço", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });
});
 
describe("isValidCpf", () => {
  it("aceita com e sem máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });
 
  it("recusa dígito errado, tamanho errado e dígitos todos iguais", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});
 
describe("generateCpfs", () => {
  it("gera a quantidade pedida, sem repetir", () => {
    const list = generateCpfs(50);
    expect(list.length).toBe(50);
    expect(new Set(list).size).toBe(50);
  });
 
  it("recusa quantidades fora de 1 a 100", () => {
    expect(() => generateCpfs(0)).toThrow();
    expect(() => generateCpfs(101)).toThrow();
    expect(() => generateCpfs(2.5)).toThrow();
  });
});
