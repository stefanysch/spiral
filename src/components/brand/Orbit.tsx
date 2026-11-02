import { ORBIT } from "./paths";

type OrbitProps = {
  /** tamanho em pixels */
  size?: number;
  /** texto para leitores de tela */
  label?: string;
  className?: string;
};

/**
 * indicador de carregamento: a espiral gira enquanto o traço se desenha e se apaga.
 * usa a cor do texto em volta (currentColor), então se adapta a qualquer botão.
 */
export function Orbit({ size = 20, label = "carregando", className = "" }: OrbitProps) {
  return (
    <svg viewBox="-4.6 -4.6 9.2 9.2" width={size} height={size}
      className={`animate-orbit-spin ${className}`} role="status" aria-label={label}>
      <g transform="translate(-0.5 0)">
        <path d={ORBIT} pathLength={1} fill="none" stroke="currentColor" strokeWidth={1}
          strokeLinecap="butt" strokeDasharray="1 1" className="animate-orbit-draw" />
      </g>
    </svg>
  );
}

export function ToolLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
        <Orbit size={56} className="text-accent" />
        carregando
      </div>
    </div>
  );
}
