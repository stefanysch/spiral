import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * convite para instalar o spiral como app, fixo no canto de baixo.
 * Chrome, Edge e Android: o botão abre o pop-up nativo. iPhone e iPad: mostra o passo a passo do Safari.
 * some se o app já está instalado e volta só depois de alguns dias se a pessoa disser "agora não".
 */
export function InstallBanner() {
  const { offer, install, dismiss } = useInstallPrompt();
  if (offer === null) return null;

  return (
    <aside aria-label="instalar o spiral"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-neon sm:left-auto sm:right-4 sm:bottom-4 sm:mx-0">
      <img src="/brand/pwa-192.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">instalar o spiral</p>
        <p className="text-xs text-muted">
          {offer === "prompt"
            ? "abre como app, direto da tela inicial, e funciona sem internet."
            : <>toque em <Icon name="share" size={14} className="inline align-text-bottom" /> compartilhar e depois em “adicionar à tela de início”.</>}
        </p>
      </div>
      {offer === "prompt" && <Button variant="primary" size="sm" onClick={() => void install()}>instalar</Button>}
      <Button variant="ghost" size="sm" onClick={dismiss} aria-label="agora não">
        {offer === "prompt" ? "agora não" : <Icon name="close" size={16} />}
      </Button>
    </aside>
  );
}
