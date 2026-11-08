import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "gerador-de-numeros-aleatorios",
  name: "gerador de números aleatórios",
  description: "sorteia números inteiros num intervalo, com ou sem repetição, separados por vírgula e na ordem que você escolher.",
  category: "sorte",
  icon: "binary",
  keywords: ["sorteio", "random", "aleatorio", "numero", "inteiros", "unicos", "sem repetir", "lista", "loteria", "dado"],
  component: lazy(() => import("./GeradorDeNumerosAleatorios")),
  isNew: true,
});