/**
 * divisão de conta. todo dinheiro aqui é em CENTAVOS (número inteiro): com reais em decimal,
 * contas como 0,1 + 0,2 dão 0,30000000000000004. com inteiros a soma sempre fecha certinha.
 */

export const MAX_CENTS = 99_999_999_999; // R$ 999.999.999,99
export const MAX_PEOPLE = 1000;
export const MAX_SERVICE_PERCENT = 100;
export const MAX_STEP = 10_000; // R$ 100,00

/**
 * entende o valor digitado no jeito brasileiro: "1234,56", "1.234,56", "R$ 12,5", "50".
 * aceita ponto como decimal só quando sobram 1 ou 2 dígitos depois dele ("12.5");
 * "1.234" é mil duzentos e trinta e quatro. devolve centavos, ou null se não for um valor válido.
 */
export function parseMoney(input: string): number | null {
  const text = input.replace(/^\s*R\$\s*/i, "").replace(/\s+/g, "");
  let whole: string, frac = "";

  if (text.includes(",")) {
    const parts = text.split(",");
    if (parts.length !== 2) return null;
    const [w, f] = parts as [string, string];
    if (w !== "" && !/^\d+$/.test(w) && !/^\d{1,3}(\.\d{3})+$/.test(w)) return null;
    whole = w.replaceAll(".", "");
    frac = f;
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    whole = text.replaceAll(".", ""); // 1.234 = mil duzentos e trinta e quatro
  } else if (/^\d+\.\d{1,2}$/.test(text)) {
    [whole = "", frac = ""] = text.split(".");
  } else if (/^\d+$/.test(text)) {
    whole = text;
  } else {
    return null;
  }

  if (!/^\d*$/.test(frac) || frac.length > 2 || (whole === "" && frac === "")) return null;
  const cents = Number(whole || "0") * 100 + Number(frac.padEnd(2, "0") || "0");
  return cents <= MAX_CENTS ? cents : null;
}

/** centavos → "R$ 1.234,56" */
export function formatMoney(cents: number): string {
  const reais = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `R$ ${String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${rest}`;
}

/** taxa de serviço em centavos, arredondada para o centavo mais próximo (metade sobe) */
export function serviceCharge(cents: number, percent: number): number {
  return Math.floor((cents * percent + 50) / 100);
}

export type Group = { cents: number; people: number };
export type Split = {
  bill: number;
  service: number;
  total: number;
  /** o que sobra além do total por causa do arredondamento (0 sem arredondar) */
  difference: number;
  /** quanto cada grupo paga: 1 ou 2 grupos (quando não divide certinho, uns pagam 1 centavo a mais) */
  groups: Group[];
};

/**
 * divide `bill` entre `people` pessoas, com taxa de serviço de `percent`%.
 *
 * `step` é de quanto em quanto cada um paga, em centavos:
 * - 1 (sem arredondar): a soma é exatamente o total; se não divide exato, as primeiras pessoas pagam 1 centavo a mais.
 * - maior que 1 (ex.: 50 = de 50 em 50 centavos): todos pagam o mesmo valor, arredondado PARA CIMA até o próximo
 *   múltiplo de `step`. com 50: 33,33 → 33,50; 33,51 → 34,00; e 33,50 exato fica 33,50.
 *   para cima de propósito: arredondar para baixo deixaria a mesa devendo. o que sobra vai em `difference`.
 */
export function splitBill(bill: number, people: number, percent = 0, step = 1): Split {
  if (!Number.isInteger(bill) || bill < 0 || bill > MAX_CENTS) throw new RangeError("valor da conta inválido.");
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) throw new RangeError(`escolha de 1 a ${MAX_PEOPLE} pessoas.`);
  if (!Number.isInteger(percent) || percent < 0 || percent > MAX_SERVICE_PERCENT) {
    throw new RangeError(`a taxa de serviço vai de 0 a ${MAX_SERVICE_PERCENT}%.`);
  }

  if (!Number.isInteger(step) || step < 1 || step > MAX_STEP) throw new RangeError("arredondamento inválido.");

  const service = serviceCharge(bill, percent);
  const total = bill + service;

  if (step > 1) {
    // menor múltiplo de step que cobre total / pessoas (divisão com teto, só com inteiros)
    const d = people * step;
    const each = Math.floor((total + d - 1) / d) * step;
    return { bill, service, total, difference: each * people - total, groups: [{ cents: each, people }] };
  }

  const base = Math.floor(total / people);
  const extra = total % people; // quantas pessoas pagam 1 centavo a mais
  const groups: Group[] = [];
  if (extra > 0) groups.push({ cents: base + 1, people: extra });
  if (people - extra > 0) groups.push({ cents: base, people: people - extra });
  return { bill, service, total, difference: 0, groups };
}

/** "R$ 33,34" quando todos pagam igual; senão "1 pessoa paga R$ 33,34 e 2 pessoas pagam R$ 33,33" */
export function describeGroups(groups: readonly Group[]): string {
  if (groups.length === 1) return formatMoney(groups[0]!.cents);
  return groups.map((g) => `${g.people === 1 ? "1 pessoa paga" : `${g.people} pessoas pagam`} ${formatMoney(g.cents)}`).join(" e ");
}