import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldShellProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** campo à direita do rótulo (ex.: botão "limpar") */
  action?: ReactNode;
  children: (id: string, describedBy: string | undefined) => ReactNode;
};

/** moldura comum: rótulo, dica e mensagem de erro, ligados ao campo para leitores de tela. */
function FieldShell({ label, hint, error, action, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {action}
      </div>
      {children(id, describedBy)}
      {hint && !error && <p id={hintId} className="text-xs text-muted">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}

const inputClass = (mono: boolean, invalid: boolean) => cn(
  "w-full rounded-md border bg-surface px-3 py-2 text-fg placeholder:text-muted/70 transition",
  "hover:border-accent/60",
  invalid ? "border-danger" : "border-border",
  mono && "font-mono",
);

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string; hint?: ReactNode; error?: string; mono?: boolean; action?: ReactNode;
};

/** campo de uma linha. mono para números, códigos e horários. */
export function TextField({ label, hint, error, mono = false, action, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} action={action}>
      {(id, describedBy) => (
        <input id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy}
          className={cn(inputClass(mono, !!error), "min-h-10", className)} {...rest} />
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string; hint?: ReactNode; error?: string; mono?: boolean; action?: ReactNode;
};

/** campo de várias linhas, para textos e listas. */
export function TextAreaField({ label, hint, error, mono = false, action, className, rows = 5, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} action={action}>
      {(id, describedBy) => (
        <textarea id={id} rows={rows} aria-invalid={!!error || undefined} aria-describedby={describedBy}
          className={cn(inputClass(mono, !!error), "resize-y leading-relaxed", className)} {...rest} />
      )}
    </FieldShell>
  );
}