import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

/** esqueleto de todas as páginas: cabeçalho, menu lateral de ferramentas, conteúdo da rota atual (<Outlet />) e rodapé. */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // ao trocar de página, fecha a gaveta do menu (celular)
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg">
        pular para o conteúdo
      </a>
      <Header menuOpen={menuOpen} onMenu={() => setMenuOpen((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="conteudo" className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <ScrollRestoration />
    </div>
  );
}
