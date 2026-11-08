import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { countText, limitStatus, parseLimit } from "./logic";

/**
 * tela do contador. não tem botão: os números mudam a cada letra digitada.
 * ela só cuida da interface, a contagem vem de ./logic.ts.
 */
export default function ContadorDeCaracteres() {
  const [text, setText] = useState("");
  const [limitText, setLimitText] = useState("");

  const stats = countText(text);

  let limit: number | null = null;
  let limitError: string | undefined;
  try {
    limit = parseLimit(limitText);
  } catch (e) {
    limitError = e instanceof Error ? e.message : "limite inválido.";
  }
  const status = limit === null ? null : limitStatus(stats.characters, limit);

  const items: { label: string; value: number }[] = [
    { label: "caracteres", value: stats.characters },
    { label: "sem espaços", value: stats.charactersNoSpaces },
    { label: "palavras", value: stats.words },
    { label: "linhas", value: stats.lines },
    { label: "parágrafos", value: stats.paragraphs },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <TextAreaField label="texto" rows={10} placeholder="digite ou cole o texto aqui"
          value={text} onChange={(e) => setText(e.target.value)}
          action={text !== "" && <Button variant="ghost" size="sm" onClick={() => setText("")}>limpar</Button>} />

        <div className="sm:w-72">
          <TextField label="limite de caracteres (opcional)" type="number" inputMode="numeric" mono
            hint="por exemplo, 280 para um post. conta os caracteres com espaços."
            value={limitText} onChange={(e) => setLimitText(e.target.value)} error={limitError} />
        </div>
        {status && (
          <p aria-live="polite" className={cn("text-sm font-medium", status.over ? "text-danger" : "text-muted")}>
            {status.message}
          </p>
        )}
      </div>

      <section aria-label="contagem">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {items.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-surface px-3 py-2">
              <dt className="text-xs text-muted">{item.label}</dt>
              <dd className="font-mono text-2xl tabular-nums">{item.value.toLocaleString("pt-BR")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}