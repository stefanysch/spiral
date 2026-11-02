import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { ResultList } from "@/components/ui/Result";
import { Segmented } from "@/components/ui/Segmented";
import { formatCpf, generateCpfs, MAX_QUANTITY } from "./logic";
 
type Mask = "com" | "sem";
 
export default function GeradorDeCpf() {
  const [quantity, setQuantity] = useState("10");
  const [mask, setMask] = useState<Mask>("com");
  // já abre com 10 cpfs gerados
  const [cpfs, setCpfs] = useState<string[]>(() => generateCpfs(10));
  const [error, setError] = useState<string>();
 
  function generate() {
    try {
      setCpfs(generateCpfs(Number(quantity)));
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "não foi possível gerar.");
    }
  }
  // os cpfs ficam guardados sem máscara; a máscara só é aplicada na hora de mostrar.
  // assim, trocar "com/sem máscara" não gera CPFs novos.
  const shown = mask === "com" ? cpfs.map(formatCpf) : cpfs;
 
  return (
    <>
      <Notice>dados gerados apenas para testes.</Notice>
 
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="sm:w-40">
          <TextField label={`quantidade (até ${MAX_QUANTITY})`} type="number" inputMode="numeric" min={1} max={MAX_QUANTITY} mono
            value={quantity} onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()} />
        </div>
        <Segmented label="formato" value={mask} onChange={setMask}
          options={[{ value: "com", label: "com máscara" }, { value: "sem", label: "só números" }]} />
        <Button variant="primary" onClick={generate}>gerar</Button>
        {error && <p role="alert" className="w-full text-sm text-danger">{error}</p>}
      </div>
 
      <ResultList label="CPFs gerados" items={shown} />
    </>
  );
}