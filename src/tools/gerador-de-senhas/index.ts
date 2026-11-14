import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "gerador-de-senhas",
  name: "gerador de senhas",
  description: "cria senhas fortes e aleatórias, escolhendo tamanho e tipos de caracteres, e mostra a força de cada configuração.",
  category: "utilitarios",
  icon: "code",
  keywords: ["senha", "password", "segura", "forte", "aleatoria", "gerar senha", "caracteres especiais", "entropia"],
  component: lazy(() => import("./GeradorDeSenhas")),
  isNew: true,
});