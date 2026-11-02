import { useTheme } from "@/hooks/useTheme";
import { HAND_SPIRAL } from "@/components/brand/paths";

/**
 * botão de tema com a espiral feita à mão.
 * a cada troca, a espiral gira meia volta (escuro = 0°, claro = 180°).
 * no hover, ela dá uma pequena girada para mostrar que é clicável.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "escuro" ? "claro" : "escuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`mudar para o modo ${next}`}
      title={`Modo ${next}`}
      className="group grid size-10 place-items-center rounded-md border border-border transition hover:border-accent"
    >
      <span
        className="grid place-items-center transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${theme === "escuro" ? 0 : 180}deg)` }}
      >
        <svg
        viewBox="-1.1 -1.1 2.2 2.2"
        width={26}
        height={26}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:rotate-[25deg]"
      >
        <path
          d={HAND_SPIRAL}
          fill="none"
          stroke="var(--spiral-brand)"
          strokeWidth={0.13}
          strokeLinecap="round"
          strokeLinejoin="round"
      /></svg>
      </span>
    </button>
  );
}