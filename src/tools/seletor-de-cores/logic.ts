/**
 * conversões de cor. a cor é guardada sempre como rgb (3 inteiros de 0 a 255);
 * hex e hsl são só jeitos diferentes de escrever a mesma cor.
 */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number }; // h: 0–360, s e l: 0–100

const clampByte = (n: number) => Math.min(255, Math.max(0, Math.round(n)));

/** hsl "de verdade" (sem arredondar), usado nas contas. */
export function rgbToHslExact({ r, g, b }: Rgb): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d + 6) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

/** hsl para mostrar: inteiros (h de 0 a 359). */
export function rgbToHsl(rgb: Rgb): Hsl {
  const { h, s, l } = rgbToHslExact(rgb);
  return { h: Math.round(h) % 360, s: Math.round(s), l: Math.round(l) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100, ln = l / 100;
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = ln - c / 2;
  const sector = Math.floor(hue / 60);
  const [r1, g1, b1] =
    sector === 0 ? [c, x, 0] : sector === 1 ? [x, c, 0] : sector === 2 ? [0, c, x]
    : sector === 3 ? [0, x, c] : sector === 4 ? [x, 0, c] : [c, 0, x];
  return { r: clampByte((r1 + m) * 255), g: clampByte((g1 + m) * 255), b: clampByte((b1 + m) * 255) };
}

export type Hsv = { h: number; s: number; v: number }; // h: 0–360, s e v: 0–1

/** hsv é o modelo do quadrado de cores (como no photoshop): matiz, saturação e brilho. */
export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + 6) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hue = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;
  const sector = Math.floor(hue / 60);
  const [r1, g1, b1] =
    sector === 0 ? [c, x, 0] : sector === 1 ? [x, c, 0] : sector === 2 ? [0, c, x]
    : sector === 3 ? [0, x, c] : sector === 4 ? [x, 0, c] : [c, 0, x];
  return { r: clampByte((r1 + m) * 255), g: clampByte((g1 + m) * 255), b: clampByte((b1 + m) * 255) };
}

const hex2 = (n: number) => n.toString(16).padStart(2, "0");

/** "#RRGGBB" em maiúsculas */
export function toHex({ r, g, b }: Rgb): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
}
export function toRgbString({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}
export function toHslString(rgb: Rgb): string {
  const { h, s, l } = rgbToHsl(rgb);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const NUM = String.raw`(\d+(?:\.\d+)?)`;
const SEP = String.raw`\s*[,\s]\s*`;
const RGB_RE = new RegExp(String.raw`^(?:rgb\(\s*)?${NUM}${SEP}${NUM}${SEP}${NUM}\s*\)?$`, "i");
const HSL_RE = new RegExp(String.raw`^hsl\(\s*${NUM}(?:deg)?${SEP}${NUM}%?${SEP}${NUM}%?\s*\)$`, "i");

/**
 * entende o que a pessoa digitou: #abc, #aabbcc (com ou sem #), rgb(1, 2, 3) ou só "1, 2, 3",
 * e hsl(210, 100%, 56%). devolve null se não for uma cor válida (valores fora da faixa também).
 */
export function parseColor(input: string): Rgb | null {
  const text = input.trim();
  if (!text) return null;

  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
  }

  const rgb = RGB_RE.exec(text);
  if (rgb) {
    const parts = [rgb[1], rgb[2], rgb[3]] as string[];
    if (!parts.every((p) => /^\d+$/.test(p) && Number(p) <= 255)) return null;
    return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) };
  }

  const hsl = HSL_RE.exec(text);
  if (hsl) {
    const h = Number(hsl[1]), s = Number(hsl[2]), l = Number(hsl[3]);
    if (h > 360 || s > 100 || l > 100) return null;
    return hslToRgb({ h, s, l });
  }
  return null;
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** luminância relativa (WCAG): 0 = preto, 1 = branco */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** contraste entre duas cores (de 1 a 21), como nas regras de acessibilidade WCAG */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** mostra o contraste com 2 casas, sempre arredondando para baixo (4,499 não vira "4,50") */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

/** texto normal precisa de pelo menos 4,5:1 (nível AA) */
export const passesAA = (ratio: number) => ratio >= 4.5;