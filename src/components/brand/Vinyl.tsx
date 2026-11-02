import { useEffect, useRef, useState } from "react";
import { CLEF_INNER, GROOVE } from "./paths";

/** 33⅓ rotações por minuto, em graus por segundo */
const PLAY_SPEED = (360 * (100 / 3)) / 60;

/**
 * disco de vinil interativo (página 404 ou "sobre").
 * - passar o mouse: toca a 33⅓ rpm
 * - arrastar: risca o disco
 * - soltar com força: sai girando e desacelera
 * - a luz segue o cursor e a sombra vai para o lado oposto
 */

export function Vinyl({ size = 360 }: { size?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<SVGSVGElement>(null);
  const [rpm, setRpm] = useState(0);
  const [light, setLight] = useState({ angle: 220, sx: 10, sy: 16 });

  // estado da física fica em ref: muda 60 vezes por segundo e não precisa re-renderizar.
  const s = useRef({ angle: 0, vel: 0, hovering: false, dragging: false, lastA: 0, lastT: 0,
    samples: [] as { v: number; t: number }[] });

  const center = () => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
  };
  const pointerAngle = (e: PointerEvent | React.PointerEvent) => {
    const c = center();
    return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
  };

  // luz e sombra seguem o cursor na janela inteira
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!wrapRef.current) return;
      const c = center();
      const dx = e.clientX - c.x, dy = e.clientY - c.y, len = Math.hypot(dx, dy) || 1;
      const dist = Math.min(1, len / (c.r * 2.4));
      setLight({ angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90,
        sx: (-dx / len) * 22 * dist, sy: (-dy / len) * 22 * dist + 6 });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // laço de animação
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let prev = performance.now(), raf = 0, shown = -1;
    const frame = (now: number) => {
      const st = s.current, dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      let current: number;
      if (st.dragging) {
        const last = st.samples[st.samples.length - 1];
        current = last && now - last.t < 80 ? last.v / 6 : 0;
      } else {
        const target = st.hovering && !reduce ? PLAY_SPEED : 0;
        const k = Math.abs(st.vel) > Math.abs(target) + 1 ? 1.6 : target ? 2.4 : 1.2;
        st.vel += (target - st.vel) * Math.min(1, k * dt);
        if (Math.abs(st.vel) < 0.5 && !target) st.vel = 0;
        st.angle += st.vel * dt;
        current = st.vel / 6;
      }
      if (discRef.current) discRef.current.style.transform = `rotate(${st.angle.toFixed(2)}deg)`;
      const r = Math.round(current * 10) / 10;
      if (r !== shown) { shown = r; setRpm(r); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    const st = s.current;
    st.dragging = true; st.vel = 0; st.samples = [];
    st.lastA = pointerAngle(e); st.lastT = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;
    const a = pointerAngle(e), t = performance.now();
    let d = a - st.lastA;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    st.angle += d;
    st.samples.push({ v: (d / Math.max(1, t - st.lastT)) * 1000, t });
    if (st.samples.length > 5) st.samples.shift();
    st.lastA = a; st.lastT = t;
  };
  const onUp = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    const now = performance.now(), recent = st.samples.filter((x) => now - x.t < 90);
    st.vel = recent.length ? recent.reduce((m, x) => m + x.v, 0) / recent.length : 0;
    if (e.pointerType !== "mouse") st.hovering = false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, maxWidth: "100%", aspectRatio: "1" }}>
        <div className="absolute inset-[6%] rounded-full bg-black opacity-85 blur-[22px] transition-transform duration-300"
          style={{ transform: `translate(${light.sx}px, ${light.sy}px)` }} />
        <div ref={wrapRef} className="absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing"
          role="img" aria-label="disco de vinil: passe o mouse para tocar, arraste para riscar"
          onPointerEnter={() => (s.current.hovering = true)}
          onPointerLeave={() => (s.current.hovering = false)}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <svg ref={discRef} viewBox="-20 -20 40 40" className="block h-full w-full will-change-transform">
            <circle r={19.6} fill="#120D1F" />
            <circle r={19.6} fill="none" stroke="#B026FF" strokeOpacity={0.35} strokeWidth={0.12} />
            <path d={GROOVE} transform="translate(-0.27 0)" fill="none" stroke="#B026FF" strokeOpacity={0.55} strokeWidth={0.12} />
            <circle r={6.6} fill="#0B0814" />
            <circle r={6.1} fill="#B026FF" />
            <g transform="translate(-0.2 0) scale(0.52)" color="#0B0814"
              dangerouslySetInnerHTML={{ __html: CLEF_INNER }} />
            <circle r={0.38} fill="#0B0814" />
          </svg>
          <div className="pointer-events-none absolute inset-0 rounded-full mix-blend-screen"
            style={{
              background: `conic-gradient(from ${light.angle - 26}deg, transparent 0deg, rgba(234,214,255,.16) 14deg, transparent 38deg, transparent 180deg, rgba(234,214,255,.10) 194deg, transparent 218deg)`,
              maskImage: "radial-gradient(circle, transparent 31%, #000 32%, #000 96%, transparent 97%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 31%, #000 32%, #000 96%, transparent 97%)",
            }} />
        </div>
      </div>
      <p className="font-mono text-sm tabular-nums text-accent">
        {Math.abs(rpm) < 0.05 ? 0 : rpm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} rpm
      </p>
    </div>
  );
}
