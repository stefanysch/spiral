import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ResultBox } from "@/components/ui/Result";
import { Segmented } from "@/components/ui/Segmented";
import { formatList, generateNumbers, MAX_QUANTITY, parseInteger, sortNumbers, type Order } from "./logic";

type Unique = "nao" | "sim";

export default function GeradorDeNumerosAleatorios() {
  const [quantity, setQuantity] = useState("10");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [order, setOrder] = useState<Order>("sorteio");
  const [unique, setUnique] = useState<Unique>("nao");
  // guardamos os números na ordem em que saíram. a ordem só muda como eles aparecem,
  // então trocar "ordem dos números" não sorteia tudo de novo.
  const [drawn, setDrawn] = useState<number[]>([]);
  const [error, setError] = useState<string>();

  function generate() {
    try {
      setDrawn(generateNumbers({
        quantity: parseInteger(quantity, "quantidade"),
        min: parseInteger(min, "primeiro número"),
        max: parseInteger(max, "segundo número"),
        unique: unique === "sim",
      }));
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "não foi possível gerar.");
    }
  }

  const onEnter = (e: KeyboardEvent) => e.key === "Enter" && generate();
  const text = formatList(sortNumbers(drawn, order));

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label={`quantidade de números (até ${MAX_QUANTITY})`} type="number" inputMode="numeric" mono
            value={quantity} onChange={(e) => setQuantity(e.target.value)} onKeyDown={onEnter} />
          <TextField label="inteiros entre (mínimo)" type="number" inputMode="numeric" mono
            value={min} onChange={(e) => setMin(e.target.value)} onKeyDown={onEnter} />
          <TextField label="e (máximo)" type="number" inputMode="numeric" mono
            value={max} onChange={(e) => setMax(e.target.value)} onKeyDown={onEnter} />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Segmented label="ordem dos números" value={order} onChange={setOrder}
            options={[
              { value: "sorteio", label: "como sorteados" },
              { value: "crescente", label: "crescente" },
              { value: "decrescente", label: "decrescente" },
            ]} />
          <Segmented label="números únicos" value={unique} onChange={setUnique}
            options={[{ value: "nao", label: "não" }, { value: "sim", label: "sim" }]} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={generate}>gerar números</Button>
          {drawn.length > 0 && <Button variant="ghost" onClick={() => setDrawn([])}>limpar</Button>}
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>

      <ResultBox label={drawn.length > 0 ? `resultado (${drawn.length})` : "resultado"} value={text}
        placeholder={'escolha as opções e clique em "gerar números".'} />
    </>
  );
}