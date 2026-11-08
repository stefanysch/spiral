import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Notice } from "@/components/ui/Notice";
import { ResultBox } from "@/components/ui/Result";
import { Segmented } from "@/components/ui/Segmented";
import { TextAreaField } from "@/components/ui/Field";
import { convert, inverseMode, type Mode } from "./logic";

const MODE_INFO: Record<Mode, { input: string; placeholder: string; hint: string; mono: boolean }> = {
  "texto-morse": {
    input: "texto",
    placeholder: "digite o texto aqui",
    hint: "no resultado, letras ficam separadas por espaço e palavras por /.",
    mono: false,
  },
  "morse-texto": {
    input: "código morse",
    placeholder: "... --- ... / .-.. .-",
    hint: "use . e -, um espaço entre letras e / entre palavras. o resultado vem em maiúsculas. os acentos do português também são reconhecidos.",
    mono: true,
  },
  "texto-binario": {
    input: "texto",
    placeholder: "digite o texto aqui",
    hint: "cada caractere vira 8 bits (UTF-8). acentos e emojis usam mais de um grupo de 8.",
    mono: false,
  },
  "binario-texto": {
    input: "binário",
    placeholder: "01001111 01101001",
    hint: "grupos de 8 bits, com ou sem espaço entre eles.",
    mono: true,
  },
};

export default function MorseEBinario() {
  const [mode, setMode] = useState<Mode>("texto-morse");
  const [input, setInput] = useState("");
  const [keepAccents, setKeepAccents] = useState(true);

  const info = MODE_INFO[mode];
  const { output, issue, custom } = convert(input, mode, keepAccents);

  /** usa o resultado como nova entrada e troca para a conversão contrária (ex.: texto -> morse vira morse -> texto). */
  function invert() {
    setInput(output);
    setMode(inverseMode(mode));
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <Segmented label="converter" value={mode} onChange={setMode}
          options={[
            { value: "texto-morse", label: "texto → morse" },
            { value: "morse-texto", label: "morse → texto" },
            { value: "texto-binario", label: "texto → binário" },
            { value: "binario-texto", label: "binário → texto" },
          ]} />

        <TextAreaField label={info.input} rows={6} mono={info.mono} placeholder={info.placeholder} hint={info.hint}
          value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
          action={input !== "" && <Button variant="ghost" size="sm" onClick={() => setInput("")}>limpar</Button>} />

        {mode === "texto-morse" && (
          <Checkbox checked={keepAccents} onChange={(e) => setKeepAccents(e.target.checked)}
            label="manter acentos no morse (a volta traz AÇÃO, e não ACAO)" />
        )}

        <div>
          <Button variant="ghost" disabled={output === ""} onClick={invert}>
            usar o resultado como entrada e inverter
          </Button>
        </div>
      </div>

      {issue && <Notice>{issue}</Notice>}
      {custom && (
        <Notice tone="info">
          {custom.join(" ")} {custom.length === 1 ? "usa um código próprio desta ferramenta" : "usam códigos próprios desta ferramenta"}:
          outros decodificadores de morse não entendem. para o morse padrão, desligue "manter acentos".
        </Notice>
      )}
      <ResultBox label="resultado" value={output} mono placeholder="digite algo acima e o resultado aparece aqui." />
    </>
  );
}