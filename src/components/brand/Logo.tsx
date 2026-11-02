import { S_MARK, S_MARK_VIEWBOX, WORDMARK, WORDMARK_VIEWBOX } from "./paths";

type LogoProps = {
  /** "full" = S + nome, "mark" = só o S, "word" = só o nome */
  variant?: "full" | "mark" | "word";
  /** altura do S em pixels */
  size?: number;
  className?: string;
};

/**
 * logo principal: o S de duas espirais (corte reto) + "spiral" em adventor.
 * o S fica no roxo da marca; o nome usa a cor do texto, então funciona nos dois temas.
 */
export function Logo({ variant = "full", size = 28, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.42 }} role="img" aria-label="spiral">
      {variant !== "word" && (
        <svg viewBox={S_MARK_VIEWBOX} style={{ height: size, width: "auto" }} aria-hidden="true">
          <path d={S_MARK} fill="none" stroke="var(--spiral-brand)" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="round" />
        </svg>
      )}
      {variant !== "mark" && (
        <svg viewBox={WORDMARK_VIEWBOX} style={{ height: size * 0.56, width: "auto", marginTop: size * 0.16 }} aria-hidden="true">
          <path d={WORDMARK} fill="currentColor" />
        </svg>
      )}
    </span>
  );
}
