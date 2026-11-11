import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "seletor-de-cores",
  name: "seletor de cores",
  description: "arraste no quadrado e na barra de matiz para achar a cor, guarde as favoritas e copie em HEX, RGB ou HSL.",
  category: "cores",
  icon: "palette",
  keywords: ["cor", "color picker", "hex", "rgb", "hsl", "paleta", "conta-gotas", "contraste"],
  component: lazy(() => import("./SeletorDeCores")),
  isNew: true,
});