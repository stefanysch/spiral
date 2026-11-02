import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL(".", import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

function imports(file: string): string[] {
  const code = readFileSync(file, "utf8");
  return [...code.matchAll(/(?:import|export)[^"']*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)]
    .map((m) => m[1] ?? m[2] ?? "");
}

const all = files(SRC).filter((f) => !f.endsWith(".test.ts"));
const rel = (f: string) => relative(SRC, f).replaceAll("\\", "/");

describe("regra de dependência", () => {
  it("lib/ e logic.ts são TypeScript puro: sem React e sem telas", () => {
    const pure = all.filter((f) => rel(f).startsWith("lib/") || rel(f).endsWith("/logic.ts"));
    for (const file of pure) {
      for (const imp of imports(file)) {
        expect(imp, `${rel(file)} importa ${imp}`).not.toMatch(/^react|^@\/(components|hooks|pages|app|tools\/registry)/);
      }
      expect(rel(file)).not.toMatch(/\.tsx$/);
    }
  });

  it("lib/ não importa nada de fora de lib/", () => {
    for (const file of all.filter((f) => rel(f).startsWith("lib/"))) {
      for (const imp of imports(file)) {
        expect(imp, `${rel(file)} importa ${imp}`).toMatch(/^\.\/|^@\/lib\//);
      }
    }
  });

  it("componentes compartilhados não conhecem ferramentas específicas", () => {
    for (const file of all.filter((f) => /^(components|hooks)\//.test(rel(f)))) {
      for (const imp of imports(file)) {
        expect(imp, `${rel(file)} importa ${imp}`).not.toMatch(/^@\/(tools|pages|app)\//);
      }
    }
  });

  it("uma ferramenta não importa outra ferramenta", () => {
    for (const file of all.filter((f) => /^tools\/[^/]+\//.test(rel(f)))) {
      const own = rel(file).split("/")[1];
      for (const imp of imports(file)) {
        const other = /^@\/tools\/([^/]+)\//.exec(imp)?.[1] ?? /^\.\.\/([^/.][^/]*)\//.exec(imp)?.[1];
        if (other) expect(other, `${rel(file)} importa a ferramenta ${other}`).toBe(own);
      }
    }
  });
});