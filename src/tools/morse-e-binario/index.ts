import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "morse-e-binario",
  name: "morse e binário",
  description: "converte texto em código morse ou binário, e de volta para texto, na hora.",
  category: "texto",
  icon: "binary",
  keywords: ["morse", "codigo morse", "binario", "binary", "bits", "utf-8", "converter", "traducao", "sos", "telegrafo"],
  component: lazy(() => import("./MorseEBinario")),
  isNew: true,
});