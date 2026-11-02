/**
 * aleatoriedade segura com crypto.getRandomValues.
 * math.random() não serve: é previsível e não foi feito para isso.
 *
 * todas as funções recebem uma "fonte" opcional. no site usamos a do navegador;
 * nos testes passamos uma fonte fixa para o resultado ser sempre o mesmo.
 */

/** preenche o array (no lugar) com números aleatórios de 32 bits. */
export type RandomSource = (buffer: Uint32Array<ArrayBuffer>) => void;

export const cryptoSource: RandomSource = (buffer) => {
  crypto.getRandomValues(buffer);
};

/**
 * inteiro aleatório de 0 até max - 1, sem viés.
 */
export function randomInt(max: number, source: RandomSource = cryptoSource): number {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) {
    throw new RangeError(`max precisa ser um inteiro entre 1 e 2^32 (recebi ${max})`);
  }
  const limit = 2 ** 32 - (2 ** 32 % max);
  const buf = new Uint32Array(1);
  for (;;) {
    source(buf);
    const value = buf[0] ?? 0;
    if (value < limit) return value % max;
  }
}

/** escolhe um item da lista. */
export function pick<T>(items: readonly T[], source: RandomSource = cryptoSource): T {
  if (items.length === 0) throw new RangeError("lista vazia");
  return items[randomInt(items.length, source)] as T;
}

/** fonte previsível para testes: devolve os valores em sequência, em loop. */
export function sequenceSource(values: readonly number[]): RandomSource {
  let i = 0;
  return (buffer) => {
    for (let j = 0; j < buffer.length; j++) {
      buffer[j] = values[i % values.length] ?? 0;
      i++;
    }
  };
}