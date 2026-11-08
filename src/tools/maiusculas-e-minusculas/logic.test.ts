import { describe, expect, it } from "vitest";
import { convertCase } from "./logic";
 
describe("convertCase", () => {
  it("passa tudo para maiúsculas, mantendo os acentos", () => {
    expect(convertCase("olá, mundo!", "upper")).toBe("OLÁ, MUNDO!");
    expect(convertCase("coração e ação", "upper")).toBe("CORAÇÃO E AÇÃO");
  });
  it("passa tudo para minúsculas, mantendo os acentos", () => {
    expect(convertCase("OLÁ, MUNDO!", "lower")).toBe("olá, mundo!");
    expect(convertCase("CORAÇÃO E AÇÃO", "lower")).toBe("coração e ação");
  });
  it("mistura de maiúsculas e minúsculas vira tudo igual", () => {
    expect(convertCase("Spiral Ferramentas", "upper")).toBe("SPIRAL FERRAMENTAS");
    expect(convertCase("Spiral Ferramentas", "lower")).toBe("spiral ferramentas");
  });
  it("não mexe em números, símbolos, espaços e quebras de linha", () => {
    expect(convertCase("a1 b2\n  c3 - d4 @ e5", "upper")).toBe("A1 B2\n  C3 - D4 @ E5");
    expect(convertCase("A1 B2\n  C3 - D4 @ E5", "lower")).toBe("a1 b2\n  c3 - d4 @ e5");
  });
  it("texto vazio continua vazio", () => {
    expect(convertCase("", "upper")).toBe("");
    expect(convertCase("", "lower")).toBe("");
  });
  it("ida e volta não perde as letras", () => {
    const original = "áéíóú çãõ âêô àü";
    expect(convertCase(convertCase(original, "upper"), "lower")).toBe(original);
  });
});