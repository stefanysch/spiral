/**
 * como um cpf funciona: são 11 dígitos. os 9 primeiros são a "base"
 * e os 2 últimos são dígitos verificadores (DV), calculados a partir da base.
 * eles existem para pegar erros de digitação: se um número mudar, a conta não fecha.
 */
import { cryptoSource, randomInt, type RandomSource } from "@/lib/random";

export const MAX_QUANTITY = 100;

export function checkDigit(digits: readonly number[]): number {
  const firstWeight = digits.length + 1;
  const sum = digits.reduce((total, digit, i) => total + digit * (firstWeight - i), 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** gera um cpf válido, só com números: "12345678909". */
export function generateCpf(source: RandomSource = cryptoSource): string {
  let base: number[];
  // cpfs com todos os dígitos iguais (111.111.111-11) passam na conta, mas não existem.
  do {
    base = Array.from({ length: 9 }, () => randomInt(10, source));
  } while (base.every((digit) => digit === base[0]));

  const first = checkDigit(base);
  const second = checkDigit([...base, first]);
  return [...base, first, second].join("");
}

/** coloca a máscara: "12345678909" vira "123.456.789-09". */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

/** confere se um cpf é válido (com ou sem máscara). */
export function isValidCpf(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const nums = [...digits].map(Number);
  return checkDigit(nums.slice(0, 9)) === nums[9] && checkDigit(nums.slice(0, 10)) === nums[10];
}

/** gera vários cpfs de uma vez, sem repetir. */
export function generateCpfs(quantity: number, source: RandomSource = cryptoSource): string[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new RangeError(`Escolha uma quantidade entre 1 e ${MAX_QUANTITY}.`);
  }
  const unique = new Set<string>();
  while (unique.size < quantity) unique.add(generateCpf(source));
  return [...unique];
}