import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "contador-de-caracteres",
  name: "contador de caracteres",
  description: "conta caracteres, palavras, linhas e parágrafos do texto na hora, com limite opcional.",
  category: "texto",
  icon: "code",
  keywords: ["contador", "caracteres", "palavras", "letras", "linhas", "paragrafos", "limite", "tamanho do texto", "contar"],
  component: lazy(() => import("./ContadorDeCaracteres")),
  isNew: true,
});