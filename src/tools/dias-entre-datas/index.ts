import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "dias-entre-datas",
  name: "dias entre datas",
  description: "escolha a data inicial e a final no calendário e veja os dias corridos e úteis, podendo tirar os feriados nacionais e outros dias.",
  category: "calculo",
  icon: "calendar",
  keywords: ["dias", "datas", "dias uteis", "dias úteis", "feriados", "prazo", "calendario", "quantos dias", "intervalo", "diferenca entre datas"],
  component: lazy(() => import("./DiasEntreDatas")),
  isNew: true,
});