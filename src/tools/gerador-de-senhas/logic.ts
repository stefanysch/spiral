/**
 * gerador de senhas. toda a aleatoriedade vem de @/lib/random (crypto).
 */
import { cryptoSource, randomInt, type RandomSource } from "@/lib/random";

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 64;
export const MAX_PASSWORDS = 20;

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
export const SPECIAL = "!@#$%&*()-+.,;?{[}]^><:";
export const LOOKALIKES = "0O1lI";

const MAX_ATTEMPTS = 10_000;

export type PasswordOptions = {
  length: number;
  /** quantas senhas gerar */
  count: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  special: boolean;
  /** tira 0, O, 1, l e I de todos os grupos */
  avoidLookalikes: boolean;
};

/** lê um número inteiro positivo digitado. campo vazio, decimal ou texto dá erro, não vira zero. */
export function parseWhole(text: string, label: string): number {
  const clean = text.trim();
  if (!/^\d+$/.test(clean)) throw new RangeError(`${label}: digite um número inteiro, como 16.`);
  const value = Number(clean);
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label}: esse número é grande demais.`);
  return value;
}

/** os grupos de caracteres que estão ligados, na ordem da tela, já sem os parecidos se for o caso. */
export function characterSets(options: PasswordOptions): string[] {
  const groups: [boolean, string][] = [
    [options.upper, UPPER],
    [options.lower, LOWER],
    [options.digits, DIGITS],
    [options.special, SPECIAL],
  ];
  return groups
    .filter(([enabled]) => enabled)
    .map(([, chars]) => (options.avoidLookalikes ? [...chars].filter((c) => !LOOKALIKES.includes(c)).join("") : chars));
}

export function validateOptions(options: PasswordOptions): void {
  const { length, count } = options;
  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`tamanho: escolha de ${MIN_LENGTH} a ${MAX_LENGTH} caracteres.`);
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_PASSWORDS) {
    throw new RangeError(`quantidade de senhas: escolha de 1 a ${MAX_PASSWORDS}.`);
  }
  const sets = characterSets(options);
  if (sets.length === 0) throw new RangeError("escolha pelo menos um tipo de caractere.");
  if (length < sets.length) throw new RangeError(`com ${sets.length} tipos de caracteres, o tamanho mínimo é ${sets.length}.`);
}

/**
 * gera uma senha.
 * sorteia cada caractere de todos os grupos juntos e, se faltar algum tipo marcado
 * (ex.: marcou números e não saiu nenhum), descartamos e sorteamos de novo.
 * assim toda senha válida tem exatamente a mesma chance. já "colocar um de cada tipo e embaralhar"
 * deixaria algumas senhas mais prováveis que outras.
 */
export function generatePassword(options: PasswordOptions, source: RandomSource = cryptoSource): string {
  validateOptions(options);
  const sets = characterSets(options);
  const pool = sets.join("");
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let password = "";
    for (let i = 0; i < options.length; i++) password += pool.charAt(randomInt(pool.length, source));
    if (sets.every((set) => [...password].some((char) => set.includes(char)))) return password;
  }
  throw new Error("não foi possível gerar uma senha com essas opções. tente aumentar o tamanho.");
}

/** gera várias senhas de uma vez (cada uma sorteada de forma independente). */
export function generatePasswords(options: PasswordOptions, source: RandomSource = cryptoSource): string[] {
  validateOptions(options);
  return Array.from({ length: options.count }, () => generatePassword(options, source));
}

/**
 * quantas senhas diferentes existem de um dado tamanho, usando todos os grupos
 * e tendo pelo menos um caractere de cada grupo. conta exata (inclusão-exclusão):
 * todas as sequências possíveis, menos as que não têm o grupo A, menos as que não têm o B... e assim por diante.
 * os grupos não se misturam, então somar os tamanhos dos grupos tirados dá o tamanho do que sobra.
 */
export function countCombinations(setSizes: readonly number[], length: number): bigint {
  const total = setSizes.reduce((sum, size) => sum + size, 0);
  let result = 0n;
  for (let mask = 0; mask < 2 ** setSizes.length; mask++) {
    let removed = 0;
    let removedGroups = 0;
    setSizes.forEach((size, i) => {
      if (mask & (1 << i)) {
        removed += size;
        removedGroups++;
      }
    });
    const term = BigInt(total - removed) ** BigInt(length);
    result += removedGroups % 2 === 0 ? term : -term;
  }
  return result;
}

/** logaritmo na base 2 de um bigint, com a precisão de um número normal (os números passam de 2^400). */
export function log2BigInt(value: bigint): number {
  if (value <= 0n) throw new RangeError("o número precisa ser maior que zero");
  const bits = value.toString(2).length;
  if (bits <= 53) return Math.log2(Number(value));
  const shift = bits - 53; // guardamos só os 53 primeiros bits, que é tudo que cabe com precisão num número normal
  return shift + Math.log2(Number(value >> BigInt(shift)));
}

/** bits de entropia -> quantas vezes um atacante teria de dividir ao meio o conjunto de senhas possíveis. */
export function entropyBits(options: PasswordOptions): number {
  validateOptions({ ...options, count: 1 });
  return log2BigInt(countCombinations(characterSets(options).map((set) => set.length), options.length));
}

export type Strength = "fraca" | "razoável" | "forte" | "muito forte";

/** nota geral pela entropia. é uma referência, não uma garantia. */
export function strengthOf(bits: number): Strength {
  if (bits < 40) return "fraca";
  if (bits < 60) return "razoável";
  if (bits < 80) return "forte";
  return "muito forte";
}