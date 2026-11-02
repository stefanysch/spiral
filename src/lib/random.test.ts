import { describe, expect, it } from "vitest";
import { pick, randomInt, sequenceSource } from "./random";

describe("randomInt", () => {
  it("fica sempre entre 0 e max - 1", () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(6);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(6);
    }
  });

  it("usa a fonte que recebe", () => {
    expect(randomInt(10, sequenceSource([7]))).toBe(7);
    expect(randomInt(2, sequenceSource([3]))).toBe(1);
  });

  it("descarta valores do fim que causariam viés", () => {
    expect(randomInt(3, sequenceSource([2 ** 32 - 1, 5]))).toBe(2);
  });

  it("recusa max inválido", () => {
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(1.5)).toThrow();
  });
});

describe("pick", () => {
  it("escolhe pelo índice sorteado", () => {
    expect(pick(["a", "b", "c"], sequenceSource([4]))).toBe("b");
  });
});