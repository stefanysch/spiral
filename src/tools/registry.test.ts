import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES } from "./categories";

const toolsDir = fileURLToPath(new URL(".", import.meta.url));
const folders = readdirSync(toolsDir).filter((f) => statSync(join(toolsDir, f)).isDirectory());
const registry = readFileSync(join(toolsDir, "registry.ts"), "utf8");
const RESERVED = ["sobre", "ferramentas", "brand", "assets"];

describe("registro de ferramentas", () => {
  for (const folder of folders) {
    const index = readFileSync(join(toolsDir, folder, "index.ts"), "utf8");
    const slug = /slug:\s*"([^"]+)"/.exec(index)?.[1];
    const category = /category:\s*"([^"]+)"/.exec(index)?.[1];

    describe(folder, () => {
      it("o slug é igual ao nome da pasta e só tem minúsculas, números e hífen", () => {
        expect(slug).toBe(folder);
        expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(RESERVED).not.toContain(slug);
      });
      it("usa uma categoria que existe", () => {
        expect(CATEGORIES.map((c) => c.id)).toContain(category);
      });
      it("está registrada em registry.ts", () => {
        expect(registry).toContain(`from "./${folder}"`);
      });
      it("tem lógica pura com testes", () => {
        const files = readdirSync(join(toolsDir, folder));
        expect(files).toContain("logic.ts");
        expect(files).toContain("logic.test.ts");
      });
    });
  }
});