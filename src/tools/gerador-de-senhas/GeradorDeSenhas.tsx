import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextField } from "@/components/ui/Field";
import {
  entropyBits, generatePasswords, MAX_LENGTH, MAX_PASSWORDS, MIN_LENGTH, parseWhole, SPECIAL, strengthOf,
  type PasswordOptions,
} from "./logic";

export default function GeradorDeSenhas() {
  const [length, setLength] = useState("16");
  const [count, setCount] = useState("1");
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [special, setSpecial] = useState(true);
  const [avoidLookalikes, setAvoidLookalikes] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  function readOptions(): PasswordOptions {
    return {
      length: parseWhole(length, "tamanho"),
      count: parseWhole(count, "quantidade de senhas"),
      upper, lower, digits, special, avoidLookalikes,
    };
  }

  function generate() {
    try {
      setPasswords(generatePasswords(readOptions()));
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "não foi possível gerar.");
    }
  }

  let strength: { bits: number; label: string } | undefined;
  try {
    const bits = entropyBits({ ...readOptions(), count: 1 });
    strength = { bits, label: strengthOf(bits) };
  } catch {
    strength = undefined;
  }

  const onEnter = (e: KeyboardEvent) => e.key === "Enter" && generate();

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={`tamanho da senha (${MIN_LENGTH} a ${MAX_LENGTH})`} type="number" inputMode="numeric" mono
            value={length} onChange={(e) => setLength(e.target.value)} onKeyDown={onEnter} />
          <TextField label={`número de senhas (até ${MAX_PASSWORDS})`} type="number" inputMode="numeric" mono
            value={count} onChange={(e) => setCount(e.target.value)} onKeyDown={onEnter} />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">incluir</legend>
          <Checkbox label="letras maiúsculas" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          <Checkbox label="letras minúsculas" checked={lower} onChange={(e) => setLower(e.target.checked)} />
          <Checkbox label="números" checked={digits} onChange={(e) => setDigits(e.target.checked)} />
          <Checkbox checked={special} onChange={(e) => setSpecial(e.target.checked)}
            label={<>caracteres especiais <span className="font-mono text-xs text-muted">{SPECIAL}</span></>} />
        </fieldset>

        <Checkbox label={<>evitar caracteres parecidos <span className="font-mono text-xs text-muted">0 O 1 l I</span></>}
          checked={avoidLookalikes} onChange={(e) => setAvoidLookalikes(e.target.checked)} />

        {strength && (
          <p className="text-sm text-muted">
            com essas opções, a senha é <strong className="text-fg">{strength.label}</strong>:
            cerca de <span className="font-mono">{Math.floor(strength.bits)}</span> bits de entropia.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={generate}>gerar senhas</Button>
          {passwords.length > 0 && <Button variant="ghost" onClick={() => setPasswords([])}>limpar</Button>}
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>

      <section aria-label="resultado" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-sm font-medium tracking-normal">
            resultado {passwords.length > 0 && <span className="text-muted">({passwords.length})</span>}
          </h2>
          {passwords.length > 1 && <CopyButton value={() => passwords.join("\n")} label="copiar todas" size="sm" />}
        </div>
        {passwords.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted">
            escolha as opções e clique em "gerar senhas".
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {passwords.map((password, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2">
                <span className="min-w-0 break-all font-mono">{password}</span>
                <CopyButton value={password} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}