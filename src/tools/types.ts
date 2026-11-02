import type { ComponentType, LazyExoticComponent } from "react";
import type { IconName } from "@/components/ui/Icon";
import type { CategoryId } from "./categories";

/**
 * tudo o que o site precisa saber sobre uma ferramenta.
 * o menu, a busca, as rotas e o título da página saem daqui.
 */
export type ToolDefinition = {
  /** parte do endereço: spiral.vercel.app/<slug>. Só minúsculas, números e hífen. */
  slug: string;
  /** nome que aparece no card e no título */
  name: string;
  /** uma frase dizendo o que a ferramenta faz */
  description: string;
  category: CategoryId;
  icon: IconName;
  /** palavras extras para a busca achar (sinônimos, siglas) */
  keywords: string[];
  /** a tela da ferramenta, carregada só quando alguém abre a página */
  component: LazyExoticComponent<ComponentType>;
  /** opcional: mostra um selo "novo" no card */
  isNew?: boolean;
};

/** ajuda o TypeScript a conferir o formato e deixa a definição mais legível. */
export function defineTool(tool: ToolDefinition): ToolDefinition {
  return tool;
}