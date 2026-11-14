import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "dividir-a-conta",
  name: "dividir a conta",
  description: "diga quanto gastaram e quantas pessoas vão dividir. com taxa de serviço opcional e sem perder centavo.",
  category: "calculo",
  icon: "coin",
  keywords: ["dividir", "conta", "racha", "rachar", "racha conta", "restaurante", "gorjeta", "taxa de servico", "10%", "grana", "dinheiro"],
  component: lazy(() => import("./DividirAConta")),
  isNew: true,
});