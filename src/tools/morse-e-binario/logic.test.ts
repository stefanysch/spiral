import { describe, expect, it } from "vitest";
import {
  ACCENTED_CUSTOM, ACCENTED_STANDARD, binaryToText, convert, inverseMode, MORSE, morseToText, textToBinary, textToMorse,
  type Mode,
} from "./logic";

describe("tabela morse", () => {
  it("tem letras, números e 18 sinais, sem código repetido", () => {
    const entries = Object.entries(MORSE);
    expect(entries).toHaveLength(26 + 10 + 18);
    expect(new Set(entries.map(([, code]) => code)).size).toBe(entries.length);
  });
  it("todo código usa só pontos e traços", () => {
    for (const [char, code] of Object.entries(MORSE)) expect(/^[.-]+$/.test(code), char).toBe(true);
  });
  it("códigos conhecidos conferem", () => {
    expect(MORSE.S).toBe("...");
    expect(MORSE.O).toBe("---");
    expect(MORSE.E).toBe(".");
    expect(MORSE.T).toBe("-");
    expect(MORSE["0"]).toBe("-----");
    expect(MORSE["5"]).toBe(".....");
    expect(MORSE["?"]).toBe("..--..");
    expect(MORSE["@"]).toBe(".--.-.");
  });
});

describe("textToMorse", () => {
  it("converte palavras: letras com espaço, palavras com barra", () => {
    expect(textToMorse("SOS").output).toBe("... --- ...");
    expect(textToMorse("olá mundo").output).toBe("--- .-.. .- / -- ..- -. -.. ---");
  });
  it("tira acentos e cedilha", () => {
    expect(textToMorse("ação").output).toBe(".- -.-. .- ---");
    expect(textToMorse("ÇÉÃ").output).toBe(textToMorse("CEA").output);
  });
  it("maiúscula e minúscula dão o mesmo resultado", () => {
    expect(textToMorse("Spiral").output).toBe(textToMorse("SPIRAL").output);
  });
  it("números e pontuação", () => {
    expect(textToMorse("12, ok?").output).toBe(".---- ..--- --..-- / --- -.- ..--..");
  });
  it("aspas e travessões 'bonitos' viram os simples", () => {
    expect(textToMorse("don’t").output).toBe("-.. --- -. .----. -");
    expect(textToMorse("a—b").output).toBe(textToMorse("a-b").output);
    expect(textToMorse("“oi”").output).toBe(textToMorse('"oi"').output);
  });
  it("espaços sobrando e tabs não viram barras vazias", () => {
    expect(textToMorse("  a \t  b  ").output).toBe(".- / -...");
  });
  it("mantém as linhas", () => {
    expect(textToMorse("a  b\nc").output).toBe(".- / -...\n-.-.");
    expect(textToMorse("a\r\nc").output).toBe(".-\n-.-.");
  });
  it("avisa quais caracteres foram ignorados", () => {
    const result = textToMorse("oi ☺ %");
    expect(result.output).toBe("--- ..");
    expect(result.issue).toContain("☺");
    expect(result.issue).toContain("%");
  });
  it("palavra só com caracteres sem código não deixa barra sobrando", () => {
    expect(textToMorse("a ☺ b").output).toBe(".- / -...");
  });
  it("texto vazio dá resultado vazio, sem aviso", () => {
    const result = textToMorse("");
    expect(result.output).toBe("");
    expect(result.issue).toBeUndefined();
    expect(result.custom).toBeUndefined();
  });
});

describe("morse com acentos (manter acentos ligado)", () => {
  const accented = { ...ACCENTED_STANDARD, ...ACCENTED_CUSTOM };

  it("são 13 letras acentuadas: 5 com código conhecido e 8 com código próprio", () => {
    expect(Object.keys(ACCENTED_STANDARD)).toHaveLength(5);
    expect(Object.keys(ACCENTED_CUSTOM)).toHaveLength(8);
  });
  it("nenhum código se repete, nem com a tabela padrão, nem entre os acentos", () => {
    const all = [...Object.values(MORSE), ...Object.values(accented)];
    expect(new Set(all).size).toBe(all.length);
    for (const code of Object.values(accented)) expect(/^[.-]+$/.test(code), code).toBe(true);
  });
  it("os códigos conhecidos conferem", () => {
    expect(ACCENTED_STANDARD.Ç).toBe("-.-..");
    expect(ACCENTED_STANDARD.É).toBe("..-..");
    expect(ACCENTED_STANDARD.Á).toBe(".--.-");
    expect(ACCENTED_STANDARD.Ó).toBe("---.");
  });
  it("usa o código do acento em vez de tirar", () => {
    const expected = [MORSE.A, ACCENTED_STANDARD.Ç, ACCENTED_CUSTOM.Ã, MORSE.O].join(" ");
    expect(textToMorse("ação", true).output).toBe(expected);
    expect(textToMorse("AÇÃO", true).output).toBe(expected);
  });
  it("letra com acento solto (a + til) vale o mesmo que a letra pronta", () => {
    expect(textToMorse("a\u0303", true).output).toBe(textToMorse("ã", true).output);
  });
  it("a volta mantém o acento de todas as letras, maiúsculas e minúsculas", () => {
    for (const letter of Object.keys(accented)) {
      expect(morseToText(textToMorse(letter, true).output).output, letter).toBe(letter);
      expect(morseToText(textToMorse(letter.toLowerCase(), true).output).output, letter).toBe(letter);
    }
  });
  it("ida e volta de frases com vários acentos", () => {
    const text = "Ação, não! Você já pôde ver o pingüim? À tarde, é útil.";
    expect(morseToText(textToMorse(text, true).output).output).toBe(text.toUpperCase());
  });
  it("letras acentuadas fora da lista continuam sem acento (ñ vira N)", () => {
    expect(textToMorse("ñ", true).output).toBe(MORSE.N);
  });
  it("desligado, é o morse padrão: tira os acentos", () => {
    expect(textToMorse("ação", false).output).toBe(textToMorse("acao").output);
    expect(textToMorse("ação").output).toBe(textToMorse("acao").output);
  });
  it("avisa quais letras usaram código próprio, e só elas", () => {
    expect(textToMorse("ação não", true).custom).toEqual(["Ã"]);
    expect(textToMorse("ÂÊÔ âêô", true).custom).toEqual(["Â", "Ê", "Ô"]);
    expect(textToMorse("café ação", true).custom).toEqual(["Ã"]);
    expect(textToMorse("café çá ü", true).custom).toBeUndefined();
    expect(textToMorse("ação", false).custom).toBeUndefined();
  });
  it("a volta entende os acentos mesmo que a chave esteja desligada", () => {
    const morse = textToMorse("ação", true).output;
    expect(convert(morse, "morse-texto", false).output).toBe("AÇÃO");
    expect(convert(morse, "morse-texto", true).output).toBe("AÇÃO");
  });
  it("convert repassa a chave para o texto → morse", () => {
    expect(convert("ã", "texto-morse", true).output).toBe(ACCENTED_CUSTOM.Ã);
    expect(convert("ã", "texto-morse", false).output).toBe(MORSE.A);
    expect(convert("ã", "texto-morse").output).toBe(MORSE.A);
  });
});

describe("morseToText", () => {
  it("converte letras e palavras", () => {
    expect(morseToText(".... --- .-.. .-").output).toBe("HOLA");
    expect(morseToText("--- .-.. .- / -- ..- -. -.. ---").output).toBe("OLA MUNDO");
  });
  it("aceita barra sem espaço, barra vertical e três espaços entre palavras", () => {
    expect(morseToText("...-/-..").output).toBe("V D");
    expect(morseToText(".- | -...").output).toBe("A B");
    expect(morseToText(".-   -...").output).toBe("A B");
  });
  it("aceita pontos e traços 'bonitos' e sublinhado", () => {
    expect(morseToText("·−").output).toBe("A");
    expect(morseToText("•–•").output).toBe("R");
    expect(morseToText("._").output).toBe("A");
  });
  it("código que não existe vira ? e é avisado", () => {
    const result = morseToText("...... .-");
    expect(result.output).toBe("?A"); // um espaço só separa letras da mesma palavra
    expect(result.issue).toContain("......");
  });
  it("letras no meio do código também viram ?", () => {
    const result = morseToText(".- abc");
    expect(result.output).toBe("A?");
    expect(result.issue).toContain("abc");
  });
  it("mantém as linhas", () => {
    expect(morseToText(".-\r\n-...").output).toBe("A\nB");
  });
  it("vazio dá vazio", () => {
    expect(morseToText("   ").output).toBe("");
  });
  it("ida e volta de todos os caracteres da tabela", () => {
    for (const char of Object.keys(MORSE)) {
      expect(morseToText(textToMorse(char).output).output, char).toBe(char);
    }
  });
  it("ida e volta de uma frase", () => {
    expect(morseToText(textToMorse("SOS 123, OK?").output).output).toBe("SOS 123, OK?");
  });
});

describe("textToBinary", () => {
  it("cada letra vira 8 bits", () => {
    expect(textToBinary("A").output).toBe("01000001");
    expect(textToBinary("Oi").output).toBe("01001111 01101001");
  });
  it("acentos usam 2 bytes e emojis 4 (UTF-8)", () => {
    expect(textToBinary("é").output).toBe("11000011 10101001");
    expect(textToBinary("👍").output).toBe("11110000 10011111 10010001 10001101");
  });
  it("espaço e quebra de linha também viram bits", () => {
    expect(textToBinary(" ").output).toBe("00100000");
    expect(textToBinary("\n").output).toBe("00001010");
  });
  it("vazio dá vazio", () => {
    expect(textToBinary("").output).toBe("");
  });
});

describe("binaryToText", () => {
  it("lê grupos separados por espaço", () => {
    expect(binaryToText("01001111 01101001").output).toBe("Oi");
  });
  it("lê bits juntos e grupos separados por quebra de linha", () => {
    expect(binaryToText("0100111101101001").output).toBe("Oi");
    expect(binaryToText("01001111\n01101001").output).toBe("Oi");
    expect(binaryToText("  01001111   01101001  ").output).toBe("Oi");
  });
  it("lê acentos e emojis", () => {
    expect(binaryToText("11000011 10101001").output).toBe("é");
    expect(binaryToText("11110000 10011111 10010001 10001101").output).toBe("👍");
  });
  it("recusa caractere que não é 0, 1 ou espaço", () => {
    expect(binaryToText("0100000a").issue).toContain("só pode ter 0 e 1");
    expect(binaryToText("0100 0002").issue).toContain('"2"');
  });
  it("recusa grupo com tamanho diferente de 8", () => {
    const result = binaryToText("0100 01000001");
    expect(result.output).toBe("");
    expect(result.issue).toContain('"0100" tem 4');
  });
  it("sem espaços, exige múltiplo de 8", () => {
    expect(binaryToText("010").issue).toContain("múltiplo de 8 (tem 3)");
    expect(binaryToText("010000011").issue).toContain("(tem 9)");
  });
  it("recusa bits que não são UTF-8 válido", () => {
    expect(binaryToText("11111111").issue).toContain("UTF-8");
    expect(binaryToText("11000011").issue).toContain("UTF-8"); 
  });
  it("vazio dá vazio, sem aviso", () => {
    expect(binaryToText("  ")).toEqual({ output: "" });
  });
  it("ida e volta de um texto com acento, pontuação, emoji e quebra de linha", () => {
    const text = "Olá, mundo! ção 👍\nlinha 2";
    expect(binaryToText(textToBinary(text).output).output).toBe(text);
  });
});

describe("convert e inverseMode", () => {
  it("chama a conversão certa para cada modo", () => {
    expect(convert("sos", "texto-morse").output).toBe("... --- ...");
    expect(convert("... --- ...", "morse-texto").output).toBe("SOS");
    expect(convert("A", "texto-binario").output).toBe("01000001");
    expect(convert("01000001", "binario-texto").output).toBe("A");
  });
  it("inverter duas vezes volta ao modo original", () => {
    const modes: Mode[] = ["texto-morse", "morse-texto", "texto-binario", "binario-texto"];
    for (const mode of modes) {
      expect(inverseMode(inverseMode(mode))).toBe(mode);
      expect(inverseMode(mode)).not.toBe(mode);
    }
  });
});