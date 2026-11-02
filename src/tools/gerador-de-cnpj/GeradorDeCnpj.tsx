import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { ResultList } from "@/components/ui/Result";
import { Segmented } from "@/components/ui/Segmented";
import { formatCnpj, generateCnpjs, MAX_QUANTITY, type CnpjFormat } from "./logic";

type Mask = "com" | "sem";

export default function GeradorDeCnpj() {
  const [quantity, setQuantity] = useState("10");
  const [format, setFormat] = useState<CnpjFormat>("numerico");
  const [mask, setMask] = useState<Mask>("com");
  const [cnpjs, setCnpjs] = useState<string[]>(() => generateCnpjs(10, "numerico"));
  const [error, setError] = useState<string>();

  function generate(nextFormat: CnpjFormat = format) {
    try {
      setCnpjs(generateCnpjs(Number(quantity), nextFormat));
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar.");
    }
  }

  function changeFormat(next: CnpjFormat) {
    setFormat(next);
    generate(next);
  }

  const shown = mask === "com" ? cnpjs.map(formatCnpj) : cnpjs;

  return (
    <>
      <Notice>dados gerados apenas para testes.</Notice>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <Segmented label="Tipo" value={format} onChange={changeFormat}
            options={[
              { value: "numerico", label: "numérico" },
              { value: "alfanumerico", label: "alfanumérico" },
              { value: "misturado", label: "os dois" },
            ]} />
          <Segmented label="Formato" value={mask} onChange={setMask}
            options={[{ value: "com", label: "com máscara" }, { value: "sem", label: "sem máscara" }]} />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <TextField label={`quantidade (até ${MAX_QUANTITY})`} type="number" inputMode="numeric" min={1} max={MAX_QUANTITY} mono
              value={quantity} onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()} />
          </div>
          <Button variant="primary" onClick={() => generate()}>gerar</Button>
          {error && <p role="alert" className="w-full text-sm text-danger">{error}</p>}
        </div>
      </div>

      {format !== "numerico" && (
        <Notice tone="info">
          o CNPJ alfanumérico é o formato novo da Receita Federal, emitido desde julho de 2026: letras e números
          nos 12 primeiros caracteres, e os 2 dígitos finais continuam números. confira se o sistema que você está
          testando já aceita letras.
        </Notice>
      )}

      <ResultList label="CNPJs gerados" items={shown} />
    </>
  );
}