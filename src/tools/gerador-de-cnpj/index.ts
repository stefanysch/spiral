import { lazy } from "react";
import { defineTool } from "../types";
 
export default defineTool({
  slug: "gerador-de-cnpj",
  name: "gerador de CNPJ",
  description: "gera CNPJs válidos para testes, no formato numérico ou no novo alfanumérico.",
  category: "documentos",
  icon: "id",
  keywords: ["cnpj", "empresa", "pessoa juridica", "receita", "alfanumerico", "letras", "teste", "fake"],
  component: lazy(() => import("./GeradorDeCnpj")),
  isNew: true,
});