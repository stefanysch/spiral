import { cn } from "@/lib/cn";

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * escolha entre poucas opções lado a lado (ex.: "texto → morse" / "morse → texto",
 * "numérico" / "alfanumérico").
 */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="inline-flex w-fit flex-wrap rounded-md border border-border bg-surface-2 p-1">
        {options.map((opt) => (
          <label key={opt.value} className={cn(
            "cursor-pointer rounded px-3 py-1.5 text-sm transition has-[:focus-visible]:shadow-neon",
            opt.value === value ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
          )}>
            <input type="radio" className="sr-only" name={label} value={opt.value}
              checked={opt.value === value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}