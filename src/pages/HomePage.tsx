import { Link } from "react-router";
import { TOOLS } from "@/tools/registry";
import { CATEGORIES } from "@/tools/categories";
import { Icon } from "@/components/ui/Icon";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function HomePage() {
  useDocumentTitle();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:py-16">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <img src="/brand/spiral-mao-simbolo.svg" alt="" width={64} height={64} className="size-12 shrink-0 sm:size-16" />
          <h1 className="text-3xl sm:text-4xl">ferramentas que giram em torno do que você precisa.</h1>
        </div>
        <p className="max-w-prose text-muted">geradores, conversores e calculadoras para testar e desenvolver. tudo roda no seu navegador e nada do que você digita é enviado.</p>
        <p className="text-sm text-muted">escolha uma abaixo ou no menu ao lado.</p>
      </section>

      {CATEGORIES.map((category) => {
        const tools = TOOLS.filter((tool) => tool.category === category.id);
        if (tools.length === 0) return null;
        return (
          <section key={category.id} aria-label={category.label} className="flex flex-col gap-1">
            <h2 className="mb-1 px-3 font-sans text-sm font-medium text-muted">{category.label}</h2>
            <ul className="flex flex-col">
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link to={`/${tool.slug}`}
                    className="group flex items-center gap-4 rounded-md px-3 py-3 transition hover:bg-surface-2">
                    <span className="text-accent"><Icon name={tool.icon} /></span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium transition group-hover:text-accent">{tool.name}</span>
                      <span className="text-sm text-muted">{tool.description}</span>
                    </span>
                    {tool.isNew && <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent-fg">novo</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
