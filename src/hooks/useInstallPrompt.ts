import { useCallback, useEffect, useState } from "react";
import { installOffer, isIos, type InstallOffer } from "@/lib/install";
import { useLocalStorage } from "./useLocalStorage";

/** o evento do Chrome/Edge/Android que guarda o convite de instalação (ainda fora do tipo padrão do TypeScript) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * controla o convite para instalar o spiral como app.
 * `offer` diz o que mostrar ("prompt", "ios" ou null); `install()` abre o pop-up nativo; `dismiss()` esconde por alguns dias.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>("instalar:agora-nao", null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // segura o convite para mostrar no nosso botão, na hora certa
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null); // cada evento só pode ser usado uma vez
    if (outcome === "dismissed") setDismissedAt(Date.now());
  }, [deferred, setDismissedAt]);

  const dismiss = useCallback(() => setDismissedAt(Date.now()), [setDismissedAt]);

  const offer: InstallOffer = installOffer({
    installed,
    canPrompt: deferred !== null,
    ios: isIos(navigator.userAgent, navigator.maxTouchPoints),
    dismissedAt,
    now: Date.now(),
  });

  return { offer, install, dismiss };
}
