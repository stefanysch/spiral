/**
 * sorteio de números inteiros num intervalo, com ou sem repetição.
 * toda a aleatoriedade vem de @/lib/random (crypto), nunca de math.random().
 */
import { cryptoSource, randomInt, type RandomSource } from "@/lib/random";

export const MAX_QUANTITY = 1000;
/** o sorteador sem viés aguenta intervalos de até 2^32 números (cerca de 4,29 bilhões). */
export const MAX_SPAN = 2 ** 32;

/** como os números aparecem: na ordem do sorteio, do menor para o maior ou do maior para o menor. */
export type Order = "sorteio" | "crescente" | "decrescente";

export type DrawOptions = {
  quantity: number;
  min: number;
  max: number;
  /** true = nenhum número se repete */
  unique: boolean;
};

/** lê um inteiro digitado (aceita negativo). campo vazio ou com vírgula/ponto dá erro, não vira zero. */
export function parseInteger(text: string, label: string): number {
  const clean = text.trim();
  if (!/^-?\d+$/.test(clean)) throw new RangeError(`${label}: digite um número inteiro, como 10 ou -5.`);
  const value = Number(clean);
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label}: esse número é grande demais para calcular com precisão.`);
  return value;
}

/** quantos números existem de min até max, contando os dois: de 1 a 10 são 10. */
export function spanOf(min: number, max: number): number {
  return max - min + 1;
}

/** confere as opções antes de sortear. a mensagem de erro já é a que vai para a tela. */
export function validateOptions({ quantity, min, max, unique }: DrawOptions): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new RangeError(`quantidade: escolha de 1 a ${MAX_QUANTITY}.`);
  }
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError("o intervalo tem números grandes demais para calcular com precisão.");
  }
  if (min > max) throw new RangeError("o primeiro número do intervalo precisa ser menor ou igual ao segundo.");
  const span = spanOf(min, max);
  if (span > MAX_SPAN) {
    throw new RangeError(`o intervalo é grande demais: escolha no máximo ${MAX_SPAN.toLocaleString("pt-BR")} números possíveis.`);
  }
  if (unique && quantity > span) {
    throw new RangeError(`só existem ${span.toLocaleString("pt-BR")} números de ${min} a ${max}: não dá para sortear ${quantity} sem repetir.`);
  }
}

/**
 * sorteia os números, na ordem em que saíram.
 * - com repetição: cada número é sorteado de novo, com a mesma chance.
 * - sem repetição: embaralhamento de Fisher-Yates "esparso". troca só os lugares que
 *   foram sorteados (guardados num Map), então funciona até com intervalos enormes
 *   sem criar uma lista com bilhões de números, e todo número tem a mesma chance.
 */
export function generateNumbers(options: DrawOptions, source: RandomSource = cryptoSource): number[] {
  validateOptions(options);
  const { quantity, min, max, unique } = options;
  const span = spanOf(min, max);

  if (!unique) {
    return Array.from({ length: quantity }, () => min + randomInt(span, source));
  }

  const swapped = new Map<number, number>(); // posição → número que está nela agora
  const result: number[] = [];
  for (let i = 0; i < quantity; i++) {
    const j = i + randomInt(span - i, source); // sorteia entre as posições que ainda não saíram
    const atJ = swapped.get(j) ?? j;
    swapped.set(j, swapped.get(i) ?? i); // o que estava em i vai para o lugar sorteado
    result.push(min + atJ);
  }
  return result;
}

/** devolve uma cópia na ordem pedida. "sorteio" mantém a ordem em que saiu. */
export function sortNumbers(values: readonly number[], order: Order): number[] {
  const copy = [...values];
  if (order === "crescente") copy.sort((a, b) => a - b);
  if (order === "decrescente") copy.sort((a, b) => b - a);
  return copy;
}

/** texto do resultado: os números separados por vírgula, como "4, -2, 17". */
export function formatList(values: readonly number[]): string {
  return values.join(", ");
}