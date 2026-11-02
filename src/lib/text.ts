/** funções de texto usadas em vários lugares (busca, morse, slugs). */

/** retira acentos: "ação" vira "acao". */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** deixa o texto pronto para comparar na busca: sem acento, minúsculo e sem espaços sobrando. */
export function normalizeForSearch(text: string): string {
  return removeAccents(text).toLowerCase().replace(/\s+/g, " ").trim();
}

/** true se todas as palavras da busca aparecem em algum dos textos. */
export function matchesSearch(query: string, haystack: readonly string[]): boolean {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const text = normalizeForSearch(haystack.join(" "));
  return words.every((word) => text.includes(word));
}
