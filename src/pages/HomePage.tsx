import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { TOOLS } from "@/tools/registry";
import { CATEGORIES, getCategory, type CategoryId } from "@/tools/categories";
import { matchesSearch } from "@/lib/text";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Filter = CategoryId | "todas";

export function HomePage() {
  useDocumentTitle();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const searchRef = useRef<HTMLInputElement>(null);

  // atalho: "/" foca a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visible = useMemo(() => TOOLS.filter((tool) =>
    (filter === "todas" || tool.category === filter) &&
    matchesSearch(query, [tool.name, tool.description, getCategory(tool.category).label, ...tool.keywords]),
  ), [query, filter]);

  // só mostra filtros de categorias que têm alguma ferramenta
  const usedCategories = CATEGORIES.filter((c) => TOOLS.some((t) => t.category === c.id));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:py-16">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl">ferramentas que giram em torno do que você precisa.</h1>
        <p className="max-w-prose text-muted">geradores, conversores e calculadoras para testar e desenvolver. tudo roda no seu navegador e nada do que você digita é enviado.</p>
      </section>

      <section className="flex flex-col gap-4" aria-label="Buscar e filtrar">
        <label className="relative block">
          <span className="sr-only">buscar ferramenta</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar ferramenta (cpf, horas, morse...)"
            className="min-h-12 w-full rounded-md border border-border bg-surface pl-10 pr-12 text-fg placeholder:text-muted/70 transition hover:border-accent/60" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-xs text-muted sm:block">/</kbd>
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categorias">
          {([{ id: "todas", label: "Todas" }, ...usedCategories] as const).map((c) => (
            <button key={c.id} type="button" onClick={() => setFilter(c.id)} aria-pressed={filter === c.id}
              className={cn("min-h-9 rounded-full border px-3.5 text-sm transition",
                filter === c.id ? "border-accent bg-accent text-accent-fg" : "border-border text-muted hover:border-accent hover:text-fg")}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-muted">
          nenhuma ferramenta encontrada para "{query}". tente outra palavra ou escolha "todas".
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((tool) => (
            <li key={tool.slug}>
              <Link to={`/${tool.slug}`}
                className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-accent">
                <span className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md bg-surface-2 text-accent">
                    <Icon name={tool.icon} />
                  </span>
                  {tool.isNew && <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent-fg">novo</span>}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium group-hover:text-accent">{tool.name}</span>
                  <span className="text-sm text-muted">{tool.description}</span>
                </span>
                <span className="mt-auto font-mono text-xs text-muted">{getCategory(tool.category).label.toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}