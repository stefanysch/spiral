/**
 * um cnpj tem 14 caracteres:
 *   8 de raiz (a empresa) + 4 de ordem (0001 = matriz, 0002 = primeira filial...) + 2 dígitos verificadores.
 *
 * desde julho de 2026 a Receita também emite CNPJ ALFANUMÉRICO: os 12 primeiros
 * caracteres podem ter letras maiúsculas (A–Z). os 2 dígitos verificadores continuam números.
 * a mesma conta serve para os dois formatos: cada caractere vale "código ASCII menos 48",
 * então "0"–"9" valem 0–9 (igual a antes) e "A" vale 17, "B" 18... "Z" 42.
 */
import { cryptoSource, randomInt, type RandomSource } from "@/lib/random";

export const MAX_QUANTITY = 100;

export type CnpjFormat = "numerico" | "alfanumerico" | "misturado";

const DIGITS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHANUMERIC = DIGITS + LETTERS;

export function charValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

export function checkDigit(chars: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = chars.length - 1; i >= 0; i--) {
    sum += charValue(chars[i]!) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** junta os dois dígitos verificadores ao fim dos 12 primeiros caracteres. */
export function withCheckDigits(base12: string): string {
  const first = checkDigit(base12);
  const second = checkDigit(base12 + first);
  return `${base12}${first}${second}`;
}

function randomChars(length: number, alphabet: string, source: RandomSource): string {
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length, source)]).join("");
}

export function generateCnpj(format: Exclude<CnpjFormat, "misturado">, source: RandomSource = cryptoSource): string {
  let root: string;
  do {
    root = format === "numerico"
      ? randomChars(8, DIGITS, source)
      : randomChars(8, ALPHANUMERIC, source);
  } while (
    /^(.)\1{7}$/.test(root) ||
    (format === "alfanumerico" && !/[A-Z]/.test(root)) 
  );
  return withCheckDigits(`${root}0001`);
}

/** coloca a máscara: "12ABC34501DE35" vira "12.ABC.345/01DE-35". */
export function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
}

/** confere se um cnpj é válido, numérico ou alfanumérico, com ou sem máscara. */
export function isValidCnpj(input: string): boolean {
  const clean = input.replace(/[.\/\-\s]/g, "").toUpperCase();
  if (!/^[0-9A-Z]{12}\d{2}$/.test(clean)) return false;
  if (/^(.)\1{13}$/.test(clean)) return false;
  return withCheckDigits(clean.slice(0, 12)) === clean;
}

/**
 * gera vários cnpjs sem repetir.
 */
export function generateCnpjs(quantity: number, format: CnpjFormat, source: RandomSource = cryptoSource): string[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new RangeError(`Escolha uma quantidade entre 1 e ${MAX_QUANTITY}.`);
  }
  const unique = new Set<string>();
  while (unique.size < quantity) {
    const kind = format === "misturado" ? (unique.size % 2 === 0 ? "numerico" : "alfanumerico") : format;
    unique.add(generateCnpj(kind, source));
  }
  return [...unique];
}