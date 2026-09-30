/**
 * Guardrail: o projeto é Bun ponta a ponta: `node` é PROIBIDO.
 *
 * Por que isto é um teste (e não uma regra oxlint): oxlint não lê os scripts do
 * package.json. Este bun:test é o portão que impede um agente de reintroduzir o
 * runtime Node (ex.: `node --experimental-strip-types`, harness RuleTester) que
 * caiu aqui na primeira tentativa.
 *
 * Nota: importar `node:fs`/`node:os` NÃO é "usar Node": é a implementação Bun
 * desses módulos (e o `node:` é exigido por unicorn/prefer-node-protocol).
 */

import { describe, test, expect } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/** Casa o executável `node` como comando (início, ou após && | ; ou espaço). */
const NODE_CMD = /(^|[\s&|;])node(\s|$)/;

function packageJsonPaths(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...packageJsonPaths(path));
    } else if (entry.name === "package.json") {
      files.push(path);
    }
  }
  return files;
}

describe("guardrail: sem runtime Node", () => {
  test("nenhum script de QUALQUER package.json invoca node", () => {
    const offenders: string[] = [];
    for (const file of packageJsonPaths(ROOT)) {
      const pkg = JSON.parse(readFileSync(file, "utf8")) as {
        scripts?: Record<string, string>;
      };
      for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
        if (NODE_CMD.test(cmd) || cmd.includes("--experimental-strip-types")) {
          offenders.push(`${file} → ${name}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  test("nenhum artefato de runner Node no tooling (.nodetest / .mjs / .cjs)", () => {
    const dir = join(ROOT, "tooling/oxlint-rules/rules/__tests__");
    const offenders = readdirSync(dir).filter(
      (f) => f.includes(".nodetest.") || f.endsWith(".mjs") || f.endsWith(".cjs"),
    );
    expect(offenders).toEqual([]);
  });
});
