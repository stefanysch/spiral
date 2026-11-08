import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
 
type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  label: ReactNode;
};
 
/** caixa de marcar com o texto ao lado. clicar no texto também marca. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn(
      "flex w-fit cursor-pointer items-center gap-2 rounded text-sm has-[:focus-visible]:shadow-neon", className,
    )}>
      <input type="checkbox" className="size-4 cursor-pointer accent-accent" {...rest} />
      <span>{label}</span>
    </label>
  );
}
