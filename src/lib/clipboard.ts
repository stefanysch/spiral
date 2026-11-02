/**
 * copiar para a área de transferência, com plano B.
 * 1. tenta a API moderna (navigator.clipboard).
 * 2. se falhar (navegador antigo, página sem HTTPS, permissão negada),
 *    usa o jeito antigo: um campo escondido + document.execCommand("copy").
 * 3. se nada funcionar, devolve false e a interface mostra o texto selecionado
 *    para a pessoa copiar com Ctrl+C.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // segue para o plano B
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}