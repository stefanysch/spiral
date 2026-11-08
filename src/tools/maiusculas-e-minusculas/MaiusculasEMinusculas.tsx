import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextAreaField } from "@/components/ui/Field";  
import { convertCase, type CaseMode } from "./logic";
 
/**
 * digite a frase, clique em um dos botões e o resultado aparece embaixo.
 * o texto digitado nunca é alterado: dá para converter para os dois lados quantas vezes quiser.
 */
export default function MaiusculasEMinusculas() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
 
  function convert(mode: CaseMode) {
    setResult(convertCase(text, mode));
  }
 
  function handleChange(value: string) {
    setText(value);
    setResult(null); // o texto mudou: o resultado antigo não vale mais
  }
 
  function clear() {
    setText("");
    setResult(null);
  }
 
  const empty = text.length === 0;
 
  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <TextAreaField label="frase" rows={5} placeholder="digite ou cole a frase aqui"
          value={text} onChange={(e) => handleChange(e.target.value)}
          action={!empty && <Button variant="ghost" size="sm" onClick={clear}>limpar</Button>} />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={empty} onClick={() => convert("upper")}>para MAIÚSCULAS</Button>
          <Button variant="primary" disabled={empty} onClick={() => convert("lower")}>para minúsculas</Button>
        </div>
      </div>
 
      {result !== null && (
        <section aria-label="resultado" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-sans text-sm font-medium tracking-normal">resultado</h2>
            <CopyButton value={result} size="sm" />
          </div>
          <output className="block whitespace-pre-wrap break-words rounded-md border border-border bg-bg px-4 py-3">
            {result}
          </output>
        </section>
      )}
    </>
  );
}