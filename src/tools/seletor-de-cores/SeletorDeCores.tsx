import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextField } from "@/components/ui/Field";
import {
  contrastRatio, formatRatio, hsvToRgb, parseColor, passesAA, rgbToHsv, toHex, toHslString, toRgbString,
  type Hsv, type Rgb,
} from "./logic";

type FieldId = "hex" | "rgb" | "hsl";

type EyeDropperCtor = new () => { open(): Promise<{ sRGBHex: string }> };
const EyeDropper = (globalThis as { EyeDropper?: EyeDropperCtor }).EyeDropper;

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const MAX_SAVED = 16;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** área que reage ao arrastar (mouse ou dedo) e devolve a posição de 0 a 1 em x e y */
function dragProps(onMove: (x: number, y: number) => void) {
  const handle = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onMove(clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height));
  };
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => { e.currentTarget.setPointerCapture(e.pointerId); handle(e); },
    onPointerMove: (e: PointerEvent<HTMLElement>) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) handle(e); },
  };
}

export default function SeletorDeCores() {
  const [hsv, setHsv] = useState<Hsv>({ h: 210, s: 0.88, v: 1 });
  const [saved, setSaved] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Partial<Record<FieldId, string>>>({});

  const color = hsvToRgb(hsv);
  const hex = toHex(color);
  const shown: Record<FieldId, string> = { hex, rgb: toRgbString(color), hsl: toHslString(color) };

  /** troca a cor por um rgb. em cinza o matiz some da conta, então mantém o que estava */
  function setRgb(rgb: Rgb) {
    const next = rgbToHsv(rgb);
    setHsv((cur) => (next.s === 0 || next.v === 0 ? { ...next, h: cur.h } : next));
  }
  function edit(id: FieldId, text: string) {
    setDrafts((d) => ({ ...d, [id]: text }));
    const parsed = parseColor(text);
    if (parsed) setRgb(parsed);
  }
  async function useEyeDropper() {
    try {
      const { sRGBHex } = await new EyeDropper!().open();
      const parsed = parseColor(sRGBHex);
      if (parsed) { setRgb(parsed); setDrafts({}); }
    } catch {
    }
  }
  function save() {
    setSaved((list) => [hex, ...list.filter((c) => c !== hex)].slice(0, MAX_SAVED));
  }

  // setas do teclado: o quadrado mexe em saturação/brilho, a barra em matiz
  function areaKeys(e: KeyboardEvent) {
    const step = e.shiftKey ? 0.1 : 0.01;
    const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = move[e.key];
    if (!m) return;
    e.preventDefault();
    setHsv((c) => ({ ...c, s: clamp01(c.s + m[0]), v: clamp01(c.v + m[1]) }));
  }
  function hueKeys(e: KeyboardEvent) {
    const step = e.shiftKey ? 10 : 1;
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : 0;
    if (!d) return;
    e.preventDefault();
    setHsv((c) => ({ ...c, h: Math.min(360, Math.max(0, c.h + d)) }));
  }

  const pureHue = toHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));

  return (
    <>
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-4 lg:flex-row">
        <div className="flex flex-col gap-3 lg:w-80">
          <div role="slider" tabIndex={0} aria-label="saturação e brilho"
            aria-valuetext={`saturação ${Math.round(hsv.s * 100)}%, brilho ${Math.round(hsv.v * 100)}%`}
            aria-valuenow={Math.round(hsv.s * 100)} aria-valuemin={0} aria-valuemax={100}
            onKeyDown={areaKeys}
            {...dragProps((x, y) => setHsv((c) => ({ ...c, s: x, v: 1 - y })))}
            className="relative h-56 w-full cursor-crosshair touch-none select-none rounded-md border border-border outline-none focus-visible:shadow-neon"
            style={{ backgroundColor: pureHue, backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)" }}>
            <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: hex }} />
          </div>

          <div role="slider" tabIndex={0} aria-label="matiz" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(hsv.h)}
            onKeyDown={hueKeys}
            {...dragProps((x) => setHsv((c) => ({ ...c, h: x * 360 })))}
            className="relative h-4 w-full cursor-pointer touch-none select-none rounded-full border border-border outline-none focus-visible:shadow-neon"
            style={{ backgroundImage: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}>
            <span className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: pureHue }} />
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={save}>guardar cor</Button>
            {EyeDropper && <Button onClick={useEyeDropper}>conta-gotas</Button>}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="h-16 w-full rounded-md border border-border" style={{ backgroundColor: hex }} aria-label={`cor atual ${hex}`} />
          {(Object.keys(shown) as FieldId[]).map((id) => {
            const draft = drafts[id];
            const invalid = draft !== undefined && draft.trim() !== "" && !parseColor(draft);
            return (
              <div key={id} className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField label={id.toUpperCase()} mono value={draft ?? shown[id]}
                    error={invalid ? "não entendi essa cor." : undefined}
                    onChange={(e) => edit(id, e.target.value)}
                    onBlur={() => setDrafts((d) => ({ ...d, [id]: undefined }))} />
                </div>
                <CopyButton value={shown[id]} />
              </div>
            );
          })}
        </div>
      </div>

      <section className="flex flex-col gap-2" aria-label="cores guardadas">
        <h2 className="font-sans text-sm font-medium tracking-normal">cores guardadas</h2>
        {saved.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted">
            clique em “guardar cor” para deixar uma cor aqui e comparar com as outras.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {saved.map((c) => (
              <li key={c}>
                <button type="button" title={c} aria-label={`usar ${c}`}
                  onClick={() => { const p = parseColor(c); if (p) { setRgb(p); setDrafts({}); } }}
                  className="h-10 w-10 rounded-md border border-border transition hover:scale-110 hover:border-accent"
                  style={{ backgroundColor: c }} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2" aria-label="contraste">
        <h2 className="font-sans text-sm font-medium tracking-normal">contraste do texto sobre essa cor</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {([["branco", WHITE], ["preto", BLACK]] as const).map(([name, text]) => {
            const ratio = contrastRatio(color, text);
            return (
              <div key={name} className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                style={{ backgroundColor: hex, color: toHex(text) }}>
                <span className="text-sm font-medium">texto {name}</span>
                <span className="font-mono text-sm">{formatRatio(ratio)} · {passesAA(ratio) ? "passa no AA" : "não passa no AA"}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}