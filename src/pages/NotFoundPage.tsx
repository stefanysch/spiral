import { Link } from "react-router";
import { Vinyl } from "@/components/brand/Vinyl";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("página não encontrada");
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-12 text-center">
      <Vinyl size={300} />
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">erro 404</p>
        <h1 className="text-3xl sm:text-4xl">o disco pulou.</h1>
        <p className="max-w-md text-muted">essa página não existe. enquanto isso, dá para riscar o disco: arraste ele com o mouse ou o dedo.</p>
        <Link to="/" className="mt-2 inline-flex min-h-10 items-center rounded-md border border-accent bg-accent px-4 text-sm font-medium text-accent-fg transition hover:shadow-neon">
          voltar para as ferramentas
        </Link>
      </div>
    </div>
  );
}