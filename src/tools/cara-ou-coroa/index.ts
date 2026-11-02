import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "cara-ou-coroa",
  name: "cara ou coroa",
  description: "joga uma moeda justa, uma vez ou várias, e mostra o placar.",
  category: "sorte",
  icon: "coin",
  keywords: ["moeda", "sorteio", "aleatorio", "decidir", "heads tails"],
  component: lazy(() => import("./CaraOuCoroa")),
  isNew: true,
});