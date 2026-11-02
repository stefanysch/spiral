import { cryptoSource, randomInt, type RandomSource } from "@/lib/random";

export type Face = "cara" | "coroa";

export type Tally = { cara: number; coroa: number; total: number };

/** joga a moeda uma vez. 0 = cara, 1 = coroa, com chance exata de 50%. */
export function flip(source: RandomSource = cryptoSource): Face {
  return randomInt(2, source) === 0 ? "cara" : "coroa";
}

/** joga várias vezes de uma vez (1 a 1000). */
export function flipMany(times: number, source: RandomSource = cryptoSource): Face[] {
  if (!Number.isInteger(times) || times < 1 || times > 1000) {
    throw new RangeError("Escolha um número de jogadas entre 1 e 1000.");
  }
  return Array.from({ length: times }, () => flip(source));
}

/** conta quantas caras e coroas saíram. */
export function tally(results: readonly Face[]): Tally {
  const cara = results.filter((r) => r === "cara").length;
  return { cara, coroa: results.length - cara, total: results.length };
}

/** porcentagem inteira, sem casas decimais estranhas: 2 de 3 = 67. */
export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part * 100) / total);
}

/** texto para copiar: "cara, coroa, cara" */
export function formatResults(results: readonly Face[]): string {
  return results.join(", ");
}