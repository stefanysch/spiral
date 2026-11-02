import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Orbit } from "@/components/brand/Orbit";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
  /** mostra a órbita girando e bloqueia cliques */
  loading?: boolean;
  icon?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  // só o botão principal tem o brilho neon no hover
  primary: "bg-accent text-accent-fg border-accent hover:shadow-neon",
  secondary: "bg-surface-2 text-fg border-border hover:border-accent",
  ghost: "bg-transparent text-muted border-transparent hover:text-fg hover:bg-surface-2",
};

export function Button({ variant = "secondary", size = "md", loading = false, icon, className,
  children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" ? "min-h-10 px-4 text-sm" : "min-h-8 px-2.5 text-xs",
        VARIANTS[variant], className,
      )}
      {...rest}>
      {loading ? <Orbit size={size === "md" ? 16 : 14} /> : icon}
      {children}
    </button>
  );
}