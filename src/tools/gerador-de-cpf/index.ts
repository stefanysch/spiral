import { lazy } from "react";
import { defineTool } from "../types";
 
export default defineTool({
  slug: "gerador-de-cpf",
  name: "gerador de CPF",
  description: "gera CPFs válidos para testar formulários e sistemas, com ou sem máscara.",
  category: "documentos",
  icon: "id",
  keywords: ["cpf", "documento", "pessoa fisica", "receita", "teste", "fake"],
  component: lazy(() => import("./GeradorDeCpf")),
  isNew: true,
});