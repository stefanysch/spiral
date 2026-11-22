import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";
import { TOOLS } from "@/tools/registry";
import { CATEGORIES } from "@/tools/categories";
import { matchesSearch } from "@/lib/text";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type SidebarProps = { open: boolean; onClose: () => void };

/**
 * menu lateral com todas as ferramentas, agrupadas por categoria, para trocar de uma para outra
 * sem voltar à página inicial. no celular vira uma gaveta que abre pelo botão do cabeçalho.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // atalho: "/" foca a busca; Esc fecha a gaveta
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = useMemo(() => CATEGORIES.map((category) => ({
    category,
    tools: TOOLS.filter((tool) => tool.category === category.id &&
      matchesSearch(query, [tool.name, tool.description, category.label, ...tool.keywords])),
  })).filter((g) => g.tools.length > 0), [query]);

  return (
    <>
      {open && <div className="fixed inset-0 top-16 z-20 bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside id="menu-lateral" aria-label="ferramentas"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-30 w-72 overflow-y-auto border-r border-border bg-bg p-3 transition-transform duration-200",
          "lg:sticky lg:bottom-auto lg:z-auto lg:h-[calc(100dvh-4rem)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:bg-bg/50",
          open ? "translate-x-0" : "-translate-x-full",
        )}>
        <label className="relative mb-4 block">
          <span className="sr-only">buscar ferramenta</span>
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar ferramenta"
            className="min-h-10 w-full rounded-md border border-border bg-surface pl-9 pr-8 text-sm text-fg placeholder:text-muted/70 transition hover:border-accent/60" />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-xs text-muted lg:block">/</kbd>
        </label>

        <nav aria-label="ferramentas" className="flex flex-col gap-5">
          {groups.length === 0 && (
            <p className="px-2 text-sm text-muted">nada encontrado para "{query}".</p>
          )}
          {groups.map(({ category, tools }) => (
            <div key={category.id} className="flex flex-col gap-0.5">
              <p className="px-2 pb-1 text-xs text-muted">{category.label}</p>
              {tools.map((tool) => (
                <NavLink key={tool.slug} to={`/${tool.slug}`}
                  className={({ isActive }) => cn(
                    "flex min-h-10 items-center gap-2.5 rounded-md border-l-2 px-2 text-sm transition",
                    isActive
                      ? "border-accent bg-surface-2 font-medium text-fg"
                      : "border-transparent text-muted hover:bg-surface-2 hover:text-fg",
                  )}>
                  {({ isActive }) => (
                    <>
                      <Icon name={tool.icon} size={18} className={cn("shrink-0", isActive && "text-accent")} />
                      <span className="min-w-0 flex-1 truncate">{tool.name}</span>
                      {tool.isNew && <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent-fg">novo</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
