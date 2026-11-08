export type CaseMode = "upper" | "lower";
 
// usamos as regras do português do brasil: "ç", "ã" e "é" viram "Ç", "Ã" e "É" (e voltam) sem perder o acento.
const LOCALE = "pt-BR";
 
/**
 * troca todas as letras do texto para maiúsculas ou minúsculas.
 * números, espaços, pontuação e quebras de linha ficam exatamente como estão.
 */
export function convertCase(text: string, mode: CaseMode): string {
  return mode === "upper" ? text.toLocaleUpperCase(LOCALE) : text.toLocaleLowerCase(LOCALE);
}