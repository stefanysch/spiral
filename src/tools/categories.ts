import type { IconName } from "@/components/ui/Icon";

/**
 * categorias do catálogo. a ordem aqui é a ordem dos filtros na página inicial.
 * "as const" faz o TypeScript conhecer cada id exato, então um erro de digitação
 * em category: "documento" é pego antes de rodar.
 */
export const CATEGORIES = [
  { id: "tempo", label: "tempo", icon: "clock" },
  { id: "documentos", label: "documentos", icon: "id" },
  { id: "texto", label: "texto e códigos", icon: "code" },
  { id: "cores", label: "cores", icon: "palette" },
  { id: "sorte", label: "sorte", icon: "coin" },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: IconName }>;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}