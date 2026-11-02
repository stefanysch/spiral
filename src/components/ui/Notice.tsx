import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export function Notice({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "info" }) {
  return (
    <p role="note" className={cn(
      "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
      tone === "warn" ? "border-warn/40 bg-warn/10 text-fg" : "border-border bg-surface-2 text-muted",
    )}>
      <Icon name="alert" size={18} className={cn("mt-0.5 shrink-0", tone === "warn" ? "text-warn" : "text-muted")} />
      <span>{children}</span>
    </p>
  );
}