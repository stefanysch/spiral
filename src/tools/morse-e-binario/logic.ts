import { removeAccents } from "@/lib/text";

export type Mode = "texto-morse" | "morse-texto" | "texto-binario" | "binario-texto";

export type Conversion = {
  output: string;
  issue?: string;
  custom?: string[];
};

/** a mesma conversão no sentido contrário (usado no botão "inverter"). */
export function inverseMode(mode: Mode): Mode {
  const inverse: Record<Mode, Mode> = {
    "texto-morse": "morse-texto",
    "morse-texto": "texto-morse",
    "texto-binario": "binario-texto",
    "binario-texto": "texto-binario",
  };
  return inverse[mode];
}

/** código morse internacional (letras, números e pontuação mais usada).*/
export const MORSE: Readonly<Record<string, string>> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
  $: "...-..-", "@": ".--.-.",
};

/**
 * letras acentuadas do português que têm código morse conhecido.
 * os outros acentos do português não existem no morse padrão.
 */
export const ACCENTED_STANDARD: Readonly<Record<string, string>> = {
  Á: ".--.-", Ç: "-.-..", É: "..-..", Ó: "---.", Ü: "..--",
};

/**
 * códigos próprios desta ferramenta, para a volta conseguir manter os acentos que o morse padrão não tem.
 * nenhum repete um código padrão nem um dos acima. outros decodificadores NÃO entendem estes.
 */
export const ACCENTED_CUSTOM: Readonly<Record<string, string>> = {
  À: "..-...", Â: "..-.-", Ã: "-.---", Ê: ".-.--", Í: "---.-", Ô: "-..--", Õ: "--..-", Ú: "....-.",
};

const ACCENTED: Readonly<Record<string, string>> = { ...ACCENTED_STANDARD, ...ACCENTED_CUSTOM };

/** morse -> letra. na volta, todos os códigos são reconhecidos, com ou sem a chave "manter acentos". */
const FROM_MORSE = new Map(Object.entries({ ...MORSE, ...ACCENTED }).map(([char, code]) => [code, char]));

/**
 * prepara o texto para virar morse: troca aspas e travessões "bonitos" (que o word e o celular colocam)
 * pelos simples e deixa tudo maiúsculo. os acentos são tratados letra a letra, em textToMorse.
 */
function simplify(text: string): string {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").toUpperCase();
}

const LINE_BREAK = /\r\n|\r|\n/;

/**
 * texto -> morse. letras separadas por espaço, palavras por " / ", linhas continuam linhas.
 * com keepAccents, as letras acentuadas do português ganham código (veja ACCENTED_*).
 * sem keepAccents, é o morse padrão: os acentos são tirados ("ação" vira "ACAO").
 */
export function textToMorse(text: string, keepAccents = false): Conversion {
  const ignored = new Set<string>();
  const custom = new Set<string>();

  function encodeWord(word: string): string {
    const codes: string[] = [];
    for (const char of word.normalize("NFC")) { // NFC junta "a" + "~" solto em "ã"
      const accented = keepAccents ? ACCENTED[char] : undefined;
      if (accented !== undefined) {
        codes.push(accented);
        if (char in ACCENTED_CUSTOM) custom.add(char);
        continue;
      }
      for (const base of removeAccents(char)) {
        const code = MORSE[base];
        if (code === undefined) ignored.add(char);
        else codes.push(code);
      }
    }
    return codes.join(" ");
  }

  const lines = simplify(text).split(LINE_BREAK).map((line) =>
    line.split(/\s+/).filter(Boolean).map(encodeWord).filter((word) => word !== "").join(" / "));
  return {
    output: lines.join("\n"),
    issue: ignored.size > 0 ? `não têm código morse e foram ignorados: ${[...ignored].join(" ")}` : undefined,
    custom: custom.size > 0 ? [...custom] : undefined,
  };
}

/**
 * morse -> texto. aceita . e - (ou · e –, e _ no lugar do traço), um espaço entre letras e,
 * entre palavras, "/" ou "|" ou três espaços ou mais. o resultado sai em maiúsculas.
 * reconhece também os acentos do português (veja ACCENTED_*).
 */
export function morseToText(code: string): Conversion {
  const unknown = new Set<string>();
  const lines = code.replace(/[·•∙]/g, ".").replace(/[–—−‒_]/g, "-").split(LINE_BREAK).map((line) =>
    line.split(/\s*[/|]\s*|\s{3,}/).map((word) =>
      word.split(/\s+/).filter(Boolean).map((symbol) => {
        const char = FROM_MORSE.get(symbol);
        if (char !== undefined) return char;
        unknown.add(symbol);
        return "?";
      }).join("")).filter((word) => word !== "").join(" "));
  return {
    output: lines.join("\n"),
    issue: unknown.size > 0 ? `códigos não reconhecidos (viraram "?"): ${[...unknown].join("  ")}` : undefined,
  };
}

/** texto -> binário. cada byte (UTF-8) vira 8 bits. "é" e emojis usam mais de um byte. */
export function textToBinary(text: string): Conversion {
  const bytes = new TextEncoder().encode(text);
  return { output: Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(" ") };
}

/**
 * binário -> texto. aceita grupos de 8 bits separados por espaço ou quebra de linha,
 * ou os bits todos juntos (o total precisa ser múltiplo de 8).
 */
export function binaryToText(bits: string): Conversion {
  const clean = bits.trim();
  if (clean === "") return { output: "" };

  const invalid = [...clean].find((char) => !/[01\s]/.test(char));
  if (invalid !== undefined) return { output: "", issue: `só pode ter 0 e 1 (e espaços): encontrei "${invalid}".` };

  const groups = clean.split(/\s+/);
  let bytesAsBits: string[];
  if (groups.length === 1) {
    const only = groups[0] ?? "";
    if (only.length % 8 !== 0) {
      return { output: "", issue: `sem espaços, o total de bits precisa ser múltiplo de 8 (tem ${only.length}).` };
    }
    bytesAsBits = only.match(/.{8}/g) ?? [];
  } else {
    const wrong = groups.find((group) => group.length !== 8);
    if (wrong !== undefined) {
      return { output: "", issue: `cada grupo precisa ter 8 bits, mas "${wrong}" tem ${wrong.length}.` };
    }
    bytesAsBits = groups;
  }

  try {
    const bytes = Uint8Array.from(bytesAsBits, (group) => parseInt(group, 2));
    return { output: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { output: "", issue: "esses bits não formam um texto válido (UTF-8)." };
  }
}

/** faz a conversão escolhida. */
export function convert(input: string, mode: Mode, keepAccents = false): Conversion {
  switch (mode) {
    case "texto-morse": return textToMorse(input, keepAccents);
    case "morse-texto": return morseToText(input);
    case "texto-binario": return textToBinary(input);
    case "binario-texto": return binaryToText(input);
  }
}