import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { envWithoutCursorHost } from "./host.ts";

const ROOT = join(import.meta.dir, "../..");
const UNIX_CONFIG_PATHS = [".claude/settings.json", ".codex/hooks.json"];
const CURSOR_CONFIG_PATH = ".cursor/hooks.json";
const CONFIG_PATHS = [...UNIX_CONFIG_PATHS, CURSOR_CONFIG_PATH];

/**
 * Claude Code e Codex rodam o comando num shell POSIX. O `|| pwd` importa: o
 * comprador extrai o zip e abre o agente ANTES de `git init`, e sem o fallback
 * todo hook morreria no `git rev-parse`.
 */
const UNIX_PREFIX = "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/tooling/agent-hooks/";

/**
 * O Cursor no Windows executa hooks no PowerShell. Sem `||` / `$(git…)`.
 * Hooks de projeto partem da raiz do repo (docs do Cursor).
 */
const CURSOR_PREFIX = "bun tooling/agent-hooks/run-cursor-hook.ts ";

function collectCommands(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectCommands);
  }
  if (typeof value !== "object" || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const ownCommand = typeof record.command === "string" ? [record.command] : [];
  return ownCommand.concat(Object.values(record).flatMap(collectCommands));
}

function hookScriptFromCommand(command: string): string | undefined {
  const cursorMatch = command.match(/run-cursor-hook\.ts\s+(\S+\.ts)/);
  if (cursorMatch?.[1]) {
    return cursorMatch[1];
  }
  const unixMatch = command.match(/tooling\/agent-hooks\/(\S+?\.ts)/);
  if (unixMatch?.[1] === "run-cursor-hook.ts") {
    return undefined;
  }
  return unixMatch?.[1];
}

describe("agent hook configs", () => {
  test.each(UNIX_CONFIG_PATHS)(
    "%s aponta para os scripts compartilhados via bash",
    (configPath) => {
      const config = JSON.parse(readFileSync(join(ROOT, configPath), "utf8")) as unknown;
      const commands = collectCommands(config);

      expect(commands.length).toBeGreaterThan(0);
      for (const command of commands) {
        expect(command).toContain(UNIX_PREFIX);
        // Caminho relativo quebra quando o agente POSIX roda a partir de um subdiretório.
        expect(command).not.toContain("bun tooling/agent-hooks/");
      }
    },
  );

  test("cursor hooks.json usa o launcher Bun, sem sintaxe bash", () => {
    const config = JSON.parse(readFileSync(join(ROOT, CURSOR_CONFIG_PATH), "utf8")) as unknown;
    const commands = collectCommands(config);

    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) {
      expect(command.startsWith(CURSOR_PREFIX)).toBeTrue();
      expect(command).not.toContain("||");
      expect(command).not.toContain("2>/dev/null");
      expect(command).not.toContain("$(git");
    }
  });

  test.each(CONFIG_PATHS)("%s só referencia hooks que existem e rodam", (configPath) => {
    const config = JSON.parse(readFileSync(join(ROOT, configPath), "utf8")) as unknown;
    const scripts = new Set(
      collectCommands(config).flatMap((command) => {
        const script = hookScriptFromCommand(command);
        return script ? [script] : [];
      }),
    );

    expect(scripts.size).toBeGreaterThan(0);
    for (const script of scripts) {
      const scriptPath = join(ROOT, "tooling/agent-hooks", script);
      expect(existsSync(scriptPath)).toBeTrue();

      // Entrada mínima é o pior caso do host: nenhum hook pode estourar por isso.
      // `stop_hook_active` faz o verify-before-stop sair cedo — rodar o gate
      // inteiro aqui seria testar o `verify`, não o wiring (ele tem teste próprio).
      const result = Bun.spawnSync(["bun", scriptPath], {
        cwd: join(ROOT, "src"),
        stdin: Buffer.from(JSON.stringify({ stop_hook_active: true })),
        stdout: "pipe",
        stderr: "pipe",
        env: envWithoutCursorHost(
          configPath === ".cursor/hooks.json" ? { AGENT_HOOK_SURFACE: "cursor" } : undefined,
        ),
      });
      expect(result.exitCode).toBe(0);
    }
  });

  test("a skill pre-review é descobrível no diretório compartilhado de skills", () => {
    expect(existsSync(join(ROOT, ".agents/skills/pre-review/SKILL.md"))).toBeTrue();
  });

  test("toda superfície de enforcement dos agentes tem dono no CODEOWNERS", () => {
    const codeowners = readFileSync(join(ROOT, ".github/CODEOWNERS"), "utf8");

    for (const path of ["/.agents/**", "/.claude/**", "/.codex/**", "/.cursor/**", "/tooling/**"]) {
      // Owner é placeholder trocável; o que o gate exige é que exista algum.
      expect(codeowners).toMatch(new RegExp(`^${path.replace(/[*/]/g, "\\$&")}\\s+@\\S+`, "m"));
    }
  });
});
