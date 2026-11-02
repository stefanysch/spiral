import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type ToolLayoutProps = {
  title: string;
  description: string;
  icon: IconName;
  categoryLabel: string;
  children: ReactNode;
};

/**
 * moldura de toda página de ferramenta: voltar, ícone, título, descrição e o conteúdo.
 * as ferramentas não usam isto direto: a página ToolPage já envolve cada uma.
 */
export function ToolLayout({ title, description, icon, categoryLabel, children }: ToolLayoutProps) {
  useDocumentTitle(title);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted transition hover:text-fg">
        <Icon name="arrowLeft" size={16} /> todas as ferramentas
      </Link>
      <header className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-surface text-accent">
          <Icon name={icon} size={24} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{categoryLabel}</p>
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          <p className="max-w-prose text-muted">{description}</p>
        </div>
      </header>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
