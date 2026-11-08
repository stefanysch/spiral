import { describe, expect, it } from "vitest";
import { countText, limitStatus, parseLimit } from "./logic";

describe("countText: caracteres", () => {
  it("texto vazio zera tudo", () => {
    expect(countText("")).toEqual({ characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, paragraphs: 0 });
  });
  it("conta com e sem espaços", () => {
    const stats = countText("olá mundo");
    expect(stats.characters).toBe(9);
    expect(stats.charactersNoSpaces).toBe(8);
  });
  it("espaços, tabs, quebras de linha e espaço não separável não entram no 'sem espaços'", () => {
    const stats = countText("a b\tc\nd e");
    expect(stats.characters).toBe(9);
    expect(stats.charactersNoSpaces).toBe(5);
  });
  it("emoji conta como um caractere só, mesmo os compostos", () => {
    expect(countText("👍").characters).toBe(1);
    expect(countText("👨‍👩‍👧").characters).toBe(1);
    expect(countText("oi 👍").characters).toBe(4);
  });
  it("letra com acento solto conta como um só, igual à letra pronta", () => {
    expect(countText("é").characters).toBe(1);
    expect(countText("é").characters).toBe(1);
    expect(countText("ação").characters).toBe(4);
  });
  it("quebra de linha do windows (\\r\\n) conta como um caractere", () => {
    expect(countText("a\r\nb").characters).toBe(3);
    expect(countText("a\nb").characters).toBe(3);
  });
});

describe("countText: palavras", () => {
  it("separa por espaços, tabs e quebras de linha", () => {
    expect(countText("um dois\ttrês\nquatro").words).toBe(4);
    expect(countText("  muitos     espaços  ").words).toBe(2);
  });
  it("palavra com hífen e números contam como uma", () => {
    expect(countText("guarda-chuva").words).toBe(1);
    expect(countText("2024-11-08 10,50").words).toBe(2);
  });
  it("pontuação solta não é palavra", () => {
    expect(countText("oi - tudo ... bem — ?").words).toBe(3);
    expect(countText("... --- !!!").words).toBe(0);
  });
  it("só espaços não é palavra", () => {
    expect(countText("   \n  ").words).toBe(0);
  });
  it("letras de outros alfabetos contam", () => {
    expect(countText("привет мир 你好").words).toBe(3);
  });
});

describe("countText: linhas e parágrafos", () => {
  it("uma linha, sem quebra", () => {
    const stats = countText("só uma linha");
    expect(stats.lines).toBe(1);
    expect(stats.paragraphs).toBe(1);
  });
  it("conta linhas, inclusive as vazias e a de depois do último enter", () => {
    expect(countText("a\nb\nc").lines).toBe(3);
    expect(countText("a\n\nb").lines).toBe(3);
    expect(countText("a\n").lines).toBe(2);
    expect(countText("a\r\nb\r\nc").lines).toBe(3);
  });
  it("parágrafos são separados por linha em branco, não por um enter só", () => {
    expect(countText("a\nb\nc").paragraphs).toBe(1);
    expect(countText("a\n\nb").paragraphs).toBe(2);
    expect(countText("a\n\n\n\nb\n\nc").paragraphs).toBe(3);
    expect(countText("a\r\n\r\nb").paragraphs).toBe(2);
  });
  it("linha em branco com espaços também separa parágrafos", () => {
    expect(countText("a\n   \nb").paragraphs).toBe(2);
  });
  it("texto só de espaços e enters não tem parágrafos", () => {
    expect(countText("  \n \n").paragraphs).toBe(0);
  });
  it("enters no começo e no fim não criam parágrafos extras", () => {
    expect(countText("\n\na\n\n").paragraphs).toBe(1);
  });
});

describe("parseLimit", () => {
  it("campo vazio é sem limite", () => {
    expect(parseLimit("")).toBeNull();
    expect(parseLimit("   ")).toBeNull();
  });
  it("lê inteiros positivos", () => {
    expect(parseLimit("280")).toBe(280);
    expect(parseLimit(" 1 ")).toBe(1);
  });
  it("recusa zero, negativo, decimal e texto", () => {
    expect(() => parseLimit("0")).toThrow(/maior que zero/);
    for (const bad of ["-5", "1,5", "1.5", "abc", "1e3"]) {
      expect(() => parseLimit(bad), bad).toThrow(/inteiro/);
    }
  });
});

describe("limitStatus", () => {
  it("abaixo do limite, diz quanto resta (singular e plural)", () => {
    expect(limitStatus(0, 280)).toEqual({ remaining: 280, over: false, message: "restam 280 caracteres" });
    expect(limitStatus(279, 280)).toEqual({ remaining: 1, over: false, message: "resta 1 caractere" });
    expect(limitStatus(279, 1500).message).toBe("restam 1.221 caracteres");
  });
  it("no limite exato não é erro", () => {
    expect(limitStatus(280, 280)).toEqual({ remaining: 0, over: false, message: "no limite exato" });
  });
  it("acima do limite, marca como passou e diz quanto", () => {
    expect(limitStatus(281, 280)).toEqual({ remaining: -1, over: true, message: "1 caractere acima do limite" });
    expect(limitStatus(300, 280)).toEqual({ remaining: -20, over: true, message: "20 caracteres acima do limite" });
  });
});