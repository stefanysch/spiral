import { describe, expect, it } from "vitest";
import { DISMISS_DAYS, installOffer, isIos } from "./install";

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;
const base = { installed: false, canPrompt: false, ios: false, dismissedAt: null, now: NOW };

describe("isIos", () => {
  it("reconhece iPhone, iPad e iPod", () => {
    expect(isIos("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1")).toBe(true);
    expect(isIos("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari/604.1")).toBe(true);
    expect(isIos("Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)")).toBe(true);
  });
  it("iPad que se apresenta como Mac só conta se tiver tela de toque", () => {
    const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15";
    expect(isIos(mac, 5)).toBe(true);
    expect(isIos(mac, 0)).toBe(false);
  });
  it("Android e desktop não são iOS", () => {
    expect(isIos("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36")).toBe(false);
    expect(isIos("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36")).toBe(false);
  });
});

describe("installOffer", () => {
  it("oferece o pop-up nativo quando o navegador permite instalar", () => {
    expect(installOffer({ ...base, canPrompt: true })).toBe("prompt");
  });
  it("no iOS mostra as instruções (não existe pop-up nativo)", () => {
    expect(installOffer({ ...base, ios: true })).toBe("ios");
  });
  it("não oferece nada se o app já está instalado", () => {
    expect(installOffer({ ...base, canPrompt: true, installed: true })).toBeNull();
    expect(installOffer({ ...base, ios: true, installed: true })).toBeNull();
  });
  it("não oferece nada em navegador sem suporte", () => {
    expect(installOffer(base)).toBeNull();
  });
  it("respeita o 'agora não' por DISMISS_DAYS dias e volta a oferecer depois", () => {
    const early = { ...base, canPrompt: true, dismissedAt: NOW - (DISMISS_DAYS * DAY - 1) };
    const late = { ...base, canPrompt: true, dismissedAt: NOW - DISMISS_DAYS * DAY };
    expect(installOffer(early)).toBeNull();
    expect(installOffer(late)).toBe("prompt");
  });
});
