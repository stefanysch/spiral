import { Link } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" aria-label="spiral, página inicial" className="rounded-md text-fg">
          <Logo size={26} />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" className="rounded-md px-3 py-2 text-muted transition hover:text-fg">ferramentas</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
