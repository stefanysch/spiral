import { lazy } from "react";
import { defineTool } from "../types";
 
export default defineTool({
  slug: "maiusculas-e-minusculas",
  name: "maiúsculas e minúsculas",
  description: "digite uma frase e troque tudo para MAIÚSCULAS ou minúsculas com um clique.",
  category: "texto",
  icon: "code",
  keywords: ["maiuscula", "minuscula", "caixa alta", "caixa baixa", "uppercase", "lowercase", "converter texto", "letras"],
  component: lazy(() => import("./MaiusculasEMinusculas")),
  isNew: true,
});