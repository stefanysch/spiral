export type TextStats = {
  /** tudo que você vê como um caractere, contando espaços e quebras de linha */
  characters: number;
  /** o mesmo, sem espaços, tabs e quebras de linha */
  charactersNoSpaces: number;
  /** pedaços de texto separados por espaço que têm pelo menos uma letra ou número */
  words: number;
  /** linhas de texto, contando as vazias. texto vazio tem 0 linhas */
  lines: number;
  /** blocos de texto separados por uma ou mais linhas em branco */
  paragraphs: number;
};

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter("pt-BR", { granularity: "grapheme" })
  : null;

/**
 * percorre o texto "caractere por caractere" do jeito que uma pessoa enxerga.
 * o .length do JavaScript erra isso: um emoji como 👍 tem length 2 e uma família 👨‍👩‍👧 tem 8,
 * e um "é" escrito como "e" + acento solto também tem 2. aqui cada um conta 1.
 * se o navegador for antigo e não tiver Intl.Segmenter, contamos por símbolo (code point).
 */
function* characterPieces(text: string): Generator<string> {
  if (segmenter) {
    for (const part of segmenter.segment(text)) yield part.segment;
  } else {
    yield* text;
  }
}

/** conta tudo de uma vez a partir do texto. */
export function countText(text: string): TextStats {
  let characters = 0;
  let charactersNoSpaces = 0;
  for (const piece of characterPieces(text)) {
    characters++;
    if (!/^\s+$/u.test(piece)) charactersNoSpaces++;
  }

  const words = (text.match(/\S+/gu) ?? []).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

  const normalized = text.replace(/\r\n?/g, "\n"); // windows, mac antigo e linux passam a ser iguais
  const lines = text === "" ? 0 : normalized.split("\n").length;
  const paragraphs = normalized.split(/\n\s*\n/).filter((block) => block.trim() !== "").length;

  return { characters, charactersNoSpaces, words, lines, paragraphs };
}

export function parseLimit(text: string): number | null {
  const clean = text.trim();
  if (clean === "") return null;
  if (!/^\d+$/.test(clean)) throw new RangeError("limite: digite um número inteiro, como 280.");
  const value = Number(clean);
  if (value < 1 || !Number.isSafeInteger(value)) throw new RangeError("limite: digite um número maior que zero.");
  return value;
}

export type LimitStatus = {
  /** quanto falta para o limite (negativo se passou) */
  remaining: number;
  over: boolean;
  message: string;
};

/** compara a quantidade de caracteres com o limite. */
export function limitStatus(characters: number, limit: number): LimitStatus {
  const remaining = limit - characters;
  const noun = (n: number) => (n === 1 ? "caractere" : "caracteres");
  const n = Math.abs(remaining).toLocaleString("pt-BR");
  if (remaining > 0) {
    return { remaining, over: false, message: `${remaining === 1 ? "resta" : "restam"} ${n} ${noun(remaining)}` };
  }
  if (remaining === 0) return { remaining, over: false, message: "no limite exato" };
  return { remaining, over: true, message: `${n} ${noun(-remaining)} acima do limite` };
}