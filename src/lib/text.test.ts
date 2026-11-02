import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeForSearch, removeAccents } from "./text";

describe("removeAccents", () => {
  it("tira acentos e cedilha", () => {
    expect(removeAccents("ação binário Ç")).toBe("acao binario C");
  });
});

describe("normalizeForSearch", () => {
  it("deixa minúsculo e junta espaços", () => {
    expect(normalizeForSearch("  Código   MORSE ")).toBe("codigo morse");
  });
});

describe("matchesSearch", () => {
  const tool = ["Gerador de CPF", "documentos", "cpf receita"];
  it("acha por palavra, sem acento e sem maiúscula", () => {
    expect(matchesSearch("cpf", tool)).toBe(true);
    expect(matchesSearch("GERADOR", tool)).toBe(true);
    expect(matchesSearch("documento", tool)).toBe(true);
  });
  it("exige todas as palavras", () => {
    expect(matchesSearch("gerador cnpj", tool)).toBe(false);
  });
  it("busca vazia mostra tudo", () => {
    expect(matchesSearch("   ", tool)).toBe(true);
  });
});