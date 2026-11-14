import { describe, expect, it } from "vitest";
import { describeGroups, MAX_STEP, formatMoney, MAX_CENTS, MAX_PEOPLE, parseMoney, serviceCharge, splitBill } from "./logic";

describe("parseMoney", () => {
  it("jeito brasileiro", () => {
    expect(parseMoney("0")).toBe(0);
    expect(parseMoney("50")).toBe(5000);
    expect(parseMoney("12,5")).toBe(1250);
    expect(parseMoney("12,50")).toBe(1250);
    expect(parseMoney("1234,56")).toBe(123_456);
    expect(parseMoney("1.234,56")).toBe(123_456);
    expect(parseMoney("1.234.567,89")).toBe(123_456_789);
    expect(parseMoney("R$ 99,99")).toBe(9999);
    expect(parseMoney(",5")).toBe(50);
    expect(parseMoney("5,")).toBe(500);
  });
  it("ponto como decimal só com 1 ou 2 dígitos depois; com 3 é milhar", () => {
    expect(parseMoney("12.5")).toBe(1250);
    expect(parseMoney("12.50")).toBe(1250);
    expect(parseMoney("1.234")).toBe(123_400);
  });
  it("recusa o que não é valor", () => {
    for (const bad of ["", " ", ",", "abc", "1,234", "1,2,3", "12,345", "-5", "1..2", "1.23.4", "1.2345", "12,5a", "R$", "1e3", "1.234,5,6"]) {
      expect(parseMoney(bad), bad).toBeNull();
    }
  });
  it("respeita o máximo", () => {
    expect(parseMoney("999.999.999,99")).toBe(MAX_CENTS);
    expect(parseMoney("1.000.000.000,00")).toBeNull();
  });
});

describe("formatMoney", () => {
  it("separa milhares e sempre mostra 2 casas", () => {
    expect(formatMoney(0)).toBe("R$ 0,00");
    expect(formatMoney(5)).toBe("R$ 0,05");
    expect(formatMoney(1250)).toBe("R$ 12,50");
    expect(formatMoney(123_456)).toBe("R$ 1.234,56");
    expect(formatMoney(MAX_CENTS)).toBe("R$ 999.999.999,99");
  });
  it("ida e volta com parseMoney", () => {
    for (const cents of [0, 1, 99, 100, 101, 99_999, 100_000, 123_456_789, MAX_CENTS]) {
      expect(parseMoney(formatMoney(cents))).toBe(cents);
    }
  });
});

describe("serviceCharge", () => {
  it("10% de R$ 100,00 = R$ 10,00", () => expect(serviceCharge(10_000, 10)).toBe(1000));
  it("arredonda para o centavo mais próximo (metade sobe)", () => {
    expect(serviceCharge(1005, 10)).toBe(101); // 100,5 → 101
    expect(serviceCharge(1004, 10)).toBe(100); // 100,4 → 100
    expect(serviceCharge(1, 10)).toBe(0);
    expect(serviceCharge(5, 10)).toBe(1); // 0,5 → 1
  });
  it("0% não cobra nada", () => expect(serviceCharge(123_456, 0)).toBe(0));
});

describe("splitBill", () => {
  it("divide certinho quando dá", () => {
    expect(splitBill(10_000, 4).groups).toEqual([{ cents: 2500, people: 4 }]);
  });
  it("R$ 100,00 em 3: uma pessoa paga 1 centavo a mais", () => {
    const s = splitBill(10_000, 3);
    expect(s.groups).toEqual([{ cents: 3334, people: 1 }, { cents: 3333, people: 2 }]);
  });
  it("com taxa de serviço", () => {
    const s = splitBill(10_000, 3, 10);
    expect(s.service).toBe(1000);
    expect(s.total).toBe(11_000);
    expect(s.groups).toEqual([{ cents: 3667, people: 2 }, { cents: 3666, people: 1 }]);
  });
  it("1 pessoa paga tudo; conta zero dá zero", () => {
    expect(splitBill(4321, 1).groups).toEqual([{ cents: 4321, people: 1 }]);
    expect(splitBill(0, 5).groups).toEqual([{ cents: 0, people: 5 }]);
  });
  it("a soma do que todos pagam é sempre exatamente o total", () => {
    for (let bill = 0; bill < 3000; bill += 7) {
      for (const people of [1, 2, 3, 7, 10, 13, 100]) {
        for (const pct of [0, 10, 12]) {
          const s = splitBill(bill, people, pct);
          const paid = s.groups.reduce((sum, g) => sum + g.cents * g.people, 0);
          expect(paid, `${bill} / ${people} + ${pct}%`).toBe(s.total);
          expect(s.groups.reduce((n, g) => n + g.people, 0)).toBe(people);
          // a diferença entre quem paga mais e menos é de no máximo 1 centavo
          if (s.groups.length === 2) expect(s.groups[0]!.cents - s.groups[1]!.cents).toBe(1);
        }
      }
    }
  });
  it("funciona no maior valor com a maior taxa e muita gente", () => {
    const s = splitBill(MAX_CENTS, MAX_PEOPLE, 100);
    expect(s.total).toBe(MAX_CENTS * 2);
    expect(s.groups.reduce((sum, g) => sum + g.cents * g.people, 0)).toBe(s.total);
  });
  it("recusa valores inválidos", () => {
    expect(() => splitBill(100, 0)).toThrow(/pessoas/);
    expect(() => splitBill(100, MAX_PEOPLE + 1)).toThrow(/pessoas/);
    expect(() => splitBill(100, 2.5)).toThrow(/pessoas/);
    expect(() => splitBill(100, 2, -1)).toThrow(/taxa/);
    expect(() => splitBill(100, 2, 101)).toThrow(/taxa/);
    expect(() => splitBill(-1, 2)).toThrow(/conta/);
    expect(() => splitBill(1.5, 2)).toThrow(/conta/);
  });
});

describe("describeGroups", () => {
  it("todos pagam igual: só o valor", () => {
    expect(describeGroups(splitBill(10_000, 4).groups)).toBe("R$ 25,00");
  });
  it("quando não divide exato, diz quem paga cada valor", () => {
    expect(describeGroups(splitBill(10_000, 3).groups)).toBe("1 pessoa paga R$ 33,34 e 2 pessoas pagam R$ 33,33");
    expect(describeGroups(splitBill(10_000, 7).groups)).toBe("4 pessoas pagam R$ 14,29 e 3 pessoas pagam R$ 14,28");
  });
});

describe("splitBill com arredondamento (para cima, de 50 em 50 centavos)", () => {
  it("menos de 50 centavos sobe para 50: R$ 100,00 em 3 → 33,33 → R$ 33,50", () => {
    const s = splitBill(10_000, 3, 0, 50);
    expect(s.groups).toEqual([{ cents: 3350, people: 3 }]);
    expect(s.difference).toBe(50);
  });
  it("mais de 50 centavos sobe para o real seguinte: 33,51 → 34,00", () => {
    expect(splitBill(3351, 1, 0, 50).groups[0]!.cents).toBe(3400);
    expect(splitBill(11_000, 7, 0, 50).groups[0]!.cents).toBe(1600); // 15,71 → 16,00
  });
  it("exatamente 50 centavos fica como está: 33,50 → 33,50", () => {
    expect(splitBill(3350, 1, 0, 50).groups[0]!.cents).toBe(3350);
    const s = splitBill(10_050, 3, 0, 50); // 100,50 / 3 = 33,50
    expect(s.groups).toEqual([{ cents: 3350, people: 3 }]);
    expect(s.difference).toBe(0);
  });
  it("valor já redondo não muda: 40,00 → 40,00; 40,49 → 40,50; 40,51 → 41,00", () => {
    expect(splitBill(4000, 1, 0, 50).groups[0]!.cents).toBe(4000);
    expect(splitBill(4049, 1, 0, 50).groups[0]!.cents).toBe(4050);
    expect(splitBill(4051, 1, 0, 50).groups[0]!.cents).toBe(4100);
  });
  it("1 centavo acima de um valor redondo já sobe: 40,01 → 40,50", () => {
    expect(splitBill(4001, 1, 0, 50).groups[0]!.cents).toBe(4050);
  });
  it("com taxa de serviço: R$ 100,00 + 10% em 3 → 36,67 → R$ 37,00", () => {
    const s = splitBill(10_000, 3, 10, 50);
    expect(s.groups).toEqual([{ cents: 3700, people: 3 }]);
    expect(s.difference).toBe(100);
  });
  it("passo de R$ 1,00 também funciona: 33,33 → 34,00", () => {
    expect(splitBill(10_000, 3, 0, 100).groups).toEqual([{ cents: 3400, people: 3 }]);
  });
  it("sem arredondar não tem diferença", () => {
    expect(splitBill(10_000, 3).difference).toBe(0);
  });
  it("conta zero dá zero", () => {
    expect(splitBill(0, 3, 0, 50).groups).toEqual([{ cents: 0, people: 3 }]);
  });
  it("sempre: múltiplo do passo, cobre a conta e é o menor valor que cobre", () => {
    for (let bill = 0; bill < 5000; bill += 13) {
      for (const people of [1, 2, 3, 7, 10, 13]) {
        for (const step of [10, 50, 100, 250]) {
          for (const pct of [0, 10]) {
            const s = splitBill(bill, people, pct, step);
            const each = s.groups[0]!.cents;
            const id = `${bill}/${people} +${pct}% passo ${step}`;
            expect(each % step, id).toBe(0);
            expect(each * people - s.total, id).toBe(s.difference);
            expect(s.difference >= 0, id).toBe(true);
            expect(each === 0 || (each - step) * people < s.total, id).toBe(true); 
          }
        }
      }
    }
  });
  it("recusa passo inválido", () => {
    expect(() => splitBill(100, 2, 0, 0)).toThrow(/arredondamento/);
    expect(() => splitBill(100, 2, 0, 1.5)).toThrow(/arredondamento/);
    expect(() => splitBill(100, 2, 0, MAX_STEP + 1)).toThrow(/arredondamento/);
  });
  it("funciona no maior valor", () => {
    const s = splitBill(99_999_999_999, 1000, 100, 10_000);
    expect(s.groups[0]!.cents * 1000 - s.total).toBe(s.difference);
  });
});