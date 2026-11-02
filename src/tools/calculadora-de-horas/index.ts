import { lazy } from "react";
import { defineTool } from "../types";

export default defineTool({
  slug: "calculadora-de-horas",
  name: "calculadora de horas",
  description: "soma e subtrai horários, com o histórico de cada operação.",
  category: "tempo",
  icon: "clock",
  keywords: ["horas", "horario", "tempo", "jornada", "banco de horas", "ponto", "somar horas", "hh:mm"],
  component: lazy(() => import("./CalculadoraDeHoras")),
  isNew: true,
});