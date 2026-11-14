import type { ToolDefinition } from "./types";
import caraOuCoroa from "./cara-ou-coroa";
import geradorDeCpf from "./gerador-de-cpf";
import geradorDeCnpj from "./gerador-de-cnpj";
import calculadoraDeHoras from "./calculadora-de-horas";
import geradorDeNumerosAleatorios from "./gerador-de-numeros-aleatorios";
import maiusculasEMinusculas from "./maiusculas-e-minusculas";
import geradorDeSenhas from "./gerador-de-senhas";
import contadorDeCaracteres from "./contador-de-caracteres";
import morseEBinario from "./morse-e-binario";
import seletorDeCores from "./seletor-de-cores";
import dividirAConta from "./dividir-a-conta";
/**
 * lugar onde uma ferramenta é registrada.
 * para adicionar uma nova: crie a pasta em src/tools/<slug>/, importe aqui e coloque na lista.
 * a ordem da lista é a ordem dos cards na página inicial.
 */
export const TOOLS: readonly ToolDefinition[] = [
  caraOuCoroa,
  geradorDeCpf,
  geradorDeCnpj,
  calculadoraDeHoras,
  geradorDeNumerosAleatorios,
  maiusculasEMinusculas,
  geradorDeSenhas,
  contadorDeCaracteres,
  morseEBinario,
  seletorDeCores,
  dividirAConta,
];

export function findTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}