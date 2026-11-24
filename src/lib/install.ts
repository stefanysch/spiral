/** quantos dias o convite de instalação some depois que a pessoa toca em "agora não" */
export const DISMISS_DAYS = 14;

const DAY_MS = 86_400_000;

/**
 * iPhone, iPad e iPod. o iPad novo se apresenta como Mac no user agent;
 * o que o entrega é a tela de toque (um Mac de verdade não tem).
 */
export function isIos(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

export type InstallOffer = "prompt" | "ios" | null;

/**
 * o que mostrar à pessoa:
 * - "prompt": o navegador deixou guardar o convite nativo (Chrome, Edge, Android); o botão dispara o pop-up.
 * - "ios": o Safari não tem pop-up; mostramos o passo a passo de "adicionar à tela de início".
 * - null: nada (já instalado, "agora não" recente ou navegador sem suporte).
 */
export function installOffer(s: {
  installed: boolean;
  canPrompt: boolean;
  ios: boolean;
  dismissedAt: number | null;
  now: number;
}): InstallOffer {
  if (s.installed) return null;
  if (s.dismissedAt !== null && s.now - s.dismissedAt < DISMISS_DAYS * DAY_MS) return null;
  if (s.canPrompt) return "prompt";
  if (s.ios) return "ios";
  return null;
}
