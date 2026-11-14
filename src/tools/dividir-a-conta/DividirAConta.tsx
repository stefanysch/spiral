import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { ResultBox } from "@/components/ui/Result";
import {
  describeGroups, formatMoney, MAX_PEOPLE, MAX_SERVICE_PERCENT, parseMoney, splitBill,
} from "./logic";

// arredonda de 50 em 50 centavos, sempre para cima (valor em centavos)
const ROUND_STEP = 50;

const wholeNumber = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text) : NaN);

export default function DividirAConta() {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("2");
  const [service, setService] = useState("");
  const [round, setRound] = useState(true);

  const bill = parseMoney(total);
  const peopleN = wholeNumber(people);
  const percent = service.trim() === "" ? 0 : wholeNumber(service);

  const billError = total.trim() !== "" && bill === null ? "digite um valor como 150,00." : undefined;
  const peopleError = people.trim() !== "" && !(peopleN >= 1 && peopleN <= MAX_PEOPLE) ? `de 1 a ${MAX_PEOPLE} pessoas.` : undefined;
  const serviceError = !(percent >= 0 && percent <= MAX_SERVICE_PERCENT) ? `de 0 a ${MAX_SERVICE_PERCENT}, sem vírgula.` : undefined;

  const ready = bill !== null && !peopleError && people.trim() !== "" && !serviceError;
  const split = ready ? splitBill(bill, peopleN, percent, round ? ROUND_STEP : 1) : null;
  const uneven = split !== null && split.groups.length === 2;

  return (
    <>
      <div className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-3">
        <TextField label="quanto gastaram (R$)" mono inputMode="decimal" placeholder="0,00" value={total}
          error={billError} onChange={(e) => setTotal(e.target.value)} />
        <TextField label="quantas pessoas" mono type="number" inputMode="numeric" min={1} max={MAX_PEOPLE} value={people}
          error={peopleError} onChange={(e) => setPeople(e.target.value)} />
        <TextField label="taxa de serviço (%)" mono type="number" inputMode="numeric" min={0} max={MAX_SERVICE_PERCENT} placeholder="opcional, ex.: 10"
          value={service} error={serviceError} onChange={(e) => setService(e.target.value)} />
      </div>

      <Checkbox checked={round} onChange={(e) => setRound(e.target.checked)}
        label="arredondar (de 50 em 50 centavos, sempre para cima)" />

      <ResultBox label={uneven ? "quanto cada um paga" : "cada pessoa paga"} large
        value={split ? describeGroups(split.groups) : ""} placeholder="preencha o valor e o número de pessoas.">
        {split && (uneven ? <span className="text-lg">{describeGroups(split.groups)}</span> : describeGroups(split.groups))}
      </ResultBox>

      {split && (
        <div className="flex flex-col gap-2">
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm">
          <dt className="text-muted">conta</dt><dd className="text-right font-mono">{formatMoney(split.bill)}</dd>
          {split.service > 0 && <><dt className="text-muted">taxa de serviço ({percent}%)</dt><dd className="text-right font-mono">{formatMoney(split.service)}</dd></>}
          <dt className="font-medium">total</dt><dd className="text-right font-mono font-medium">{formatMoney(split.total)}</dd>
          {split.difference > 0 && <><dt className="text-muted">sobra do arredondamento</dt><dd className="text-right font-mono">{formatMoney(split.difference)}</dd></>}
        </dl>
        {split.difference > 0 && <p className="text-xs text-muted">o valor de cada um sobe até os próximos 50 centavos (ou o próximo real, se passar de 50) para ninguém ficar devendo; a sobra pode virar gorjeta ou troco.</p>}
        {uneven && <p className="text-xs text-muted">não divide em centavos exatos: quem paga 1 centavo a mais cobre a diferença, e a soma fecha certinha no total.</p>}
        </div>
      )}
    </>
  );
}