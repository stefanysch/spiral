import { Link } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = { menuOpen: boolean; onMenu: () => void };

export function Header({ menuOpen, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onMenu} aria-expanded={menuOpen} aria-controls="menu-lateral"
            aria-label={menuOpen ? "fechar menu de ferramentas" : "abrir menu de ferramentas"}
            className="grid size-10 place-items-center rounded-md border border-border text-fg transition hover:border-accent hover:text-accent lg:hidden">
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <Link to="/" aria-label="spiral, página inicial" className="rounded-md text-fg transition hover:text-accent">
            <Logo size={26} />
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
