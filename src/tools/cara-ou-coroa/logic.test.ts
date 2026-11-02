import { describe, expect, it } from "vitest";
import { sequenceSource } from "@/lib/random";
import { flip, flipMany, formatResults, percent, tally } from "./logic";

describe("flip", () => {
  it("par é cara, ímpar é coroa", () => {
    expect(flip(sequenceSource([0]))).toBe("cara");
    expect(flip(sequenceSource([1]))).toBe("coroa");
    expect(flip(sequenceSource([42]))).toBe("cara");
  });

  it("com o sorteio de verdade, só sai cara ou coroa", () => {
    for (let i = 0; i < 200; i++) expect(["cara", "coroa"]).toContain(flip());
  });
});

describe("flipMany", () => {
  it("joga a quantidade pedida, em ordem", () => {
    expect(flipMany(4, sequenceSource([0, 1, 1, 0]))).toEqual(["cara", "coroa", "coroa", "cara"]);
  });

  it("recusa quantidades fora de 1 a 1000", () => {
    expect(() => flipMany(0)).toThrow();
    expect(() => flipMany(1001)).toThrow();
    expect(() => flipMany(2.5)).toThrow();
  });
});

describe("tally e percent", () => {
  it("conta e calcula a porcentagem inteira", () => {
    const t = tally(["cara", "coroa", "cara"]);
    expect(t).toEqual({ cara: 2, coroa: 1, total: 3 });
    expect(percent(t.cara, t.total)).toBe(67);
    expect(percent(0, 0)).toBe(0);
  });
});

describe("formatResults", () => {
  it("separa por vírgula", () => {
    expect(formatResults(["cara", "coroa"])).toBe("cara, coroa");
  });
});