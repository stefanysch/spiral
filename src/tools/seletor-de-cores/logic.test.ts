import { describe, expect, it } from "vitest";
import {
  contrastRatio, formatRatio, hslToRgb, hsvToRgb, parseColor, passesAA, rgbToHsl, rgbToHslExact, rgbToHsv, toHex, toHslString, toRgbString,
} from "./logic";

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

describe("escrita da cor", () => {
  it("hex em maiúsculas, com zero à esquerda", () => {
    expect(toHex({ r: 255, g: 0, b: 128 })).toBe("#FF0080");
    expect(toHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
    expect(toHex(BLACK)).toBe("#000000");
  });
  it("rgb e hsl", () => {
    expect(toRgbString({ r: 30, g: 144, b: 255 })).toBe("rgb(30, 144, 255)");
    expect(toHslString({ r: 30, g: 144, b: 255 })).toBe("hsl(210, 100%, 56%)");
  });
});

describe("rgbToHsl", () => {
  it("cores conhecidas", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
    expect(rgbToHsl(WHITE)).toEqual({ h: 0, s: 0, l: 100 });
    expect(rgbToHsl(BLACK)).toEqual({ h: 0, s: 0, l: 0 });
  });
  it("o matiz nunca chega a 360 (359,76 arredonda para 360, que vira 0)", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 1 }).h).toBe(0);
  });
});

describe("hslToRgb", () => {
  it("cores conhecidas", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
    expect(hslToRgb({ h: 60, s: 100, l: 50 })).toEqual({ r: 255, g: 255, b: 0 });
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual(WHITE);
  });
  it("360 é o mesmo que 0", () => {
    expect(hslToRgb({ h: 360, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("ida e volta rgb → hsl → rgb", () => {
  it("não perde nenhuma cor (hsl sem arredondar)", () => {
    // percorre o cubo todo com passo 5; o hsl exato volta para o mesmo rgb
    for (let r = 0; r <= 255; r += 5) for (let g = 0; g <= 255; g += 5) for (let b = 0; b <= 255; b += 5) {
      expect(hslToRgb(rgbToHslExact({ r, g, b })), `${r},${g},${b}`).toEqual({ r, g, b });
    }
  });
});

describe("parseColor", () => {
  it("hex de 6 e de 3 dígitos, com ou sem #", () => {
    expect(parseColor("#1e90ff")).toEqual({ r: 30, g: 144, b: 255 });
    expect(parseColor("1E90FF")).toEqual({ r: 30, g: 144, b: 255 });
    expect(parseColor("#fa0")).toEqual({ r: 255, g: 170, b: 0 });
    expect(parseColor("  #FFF ")).toEqual(WHITE);
  });
  it("rgb com ou sem a palavra rgb", () => {
    expect(parseColor("rgb(30, 144, 255)")).toEqual({ r: 30, g: 144, b: 255 });
    expect(parseColor("30,144,255")).toEqual({ r: 30, g: 144, b: 255 });
    expect(parseColor("30 144 255")).toEqual({ r: 30, g: 144, b: 255 });
  });
  it("hsl", () => {
    expect(parseColor("hsl(0, 100%, 50%)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("hsl(240 100% 50%)")).toEqual({ r: 0, g: 0, b: 255 });
  });
  it("recusa o que não é cor ou está fora da faixa", () => {
    for (const bad of ["", "abc1", "#12345", "#gggggg", "256, 0, 0", "1.5, 2, 3", "1, 2", "hsl(361, 0%, 0%)", "hsl(0, 101%, 0%)", "azul"]) {
      expect(parseColor(bad), bad).toBeNull();
    }
  });
});

describe("contraste", () => {
  it("preto e branco dão 21:1", () => {
    expect(Math.abs(contrastRatio(BLACK, WHITE) - 21) < 1e-9).toBe(true);
    expect(Math.abs(contrastRatio(WHITE, BLACK) - 21) < 1e-9).toBe(true);
  });
  it("a mesma cor dá 1:1", () => {
    expect(contrastRatio({ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 })).toBe(1);
  });
  it("cinza #767676 sobre branco passa no AA (4,54:1) e #777777 não (4,48:1)", () => {
    const ratio = contrastRatio({ r: 118, g: 118, b: 118 }, WHITE);
    expect(formatRatio(ratio)).toBe("4.54:1");
    expect(passesAA(ratio)).toBe(true);
    expect(passesAA(contrastRatio({ r: 119, g: 119, b: 119 }, WHITE))).toBe(false);
    expect(passesAA(contrastRatio({ r: 150, g: 150, b: 150 }, WHITE))).toBe(false);
  });
  it("formatRatio arredonda para baixo", () => {
    expect(formatRatio(4.499)).toBe("4.49:1");
    expect(formatRatio(21)).toBe("21.00:1");
  });
});

describe("hsv (quadrado de cores)", () => {
  it("cores conhecidas", () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv(WHITE)).toEqual({ h: 0, s: 0, v: 1 });
    expect(rgbToHsv(BLACK)).toEqual({ h: 0, s: 0, v: 0 });
    expect(hsvToRgb({ h: 120, s: 1, v: 1 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsvToRgb({ h: 240, s: 1, v: 0.5 })).toEqual({ r: 0, g: 0, b: 128 });
    expect(hsvToRgb({ h: 0, s: 0, v: 1 })).toEqual(WHITE);
    expect(hsvToRgb({ h: 360, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 0 });
  });
  it("ida e volta rgb → hsv → rgb não perde nenhuma cor", () => {
    for (let r = 0; r <= 255; r += 5) for (let g = 0; g <= 255; g += 5) for (let b = 0; b <= 255; b += 5) {
      expect(hsvToRgb(rgbToHsv({ r, g, b })), `${r},${g},${b}`).toEqual({ r, g, b });
    }
  });
});