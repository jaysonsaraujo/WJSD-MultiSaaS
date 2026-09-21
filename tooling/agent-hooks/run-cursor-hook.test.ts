import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const RUNNER = join(import.meta.dir, "run-cursor-hook.ts");
const FROM_SUBDIR = join(import.meta.dir, "../../src");

describe("run-cursor-hook", () => {
  test("encaminha JSON válido do Cursor para o hook", () => {
    const result = Bun.spawnSync(["bun", RUNNER, "guard-shell.ts"], {
      cwd: FROM_SUBDIR,
      stdin: Buffer.from(
        JSON.stringify({
          hook_event_name: "beforeShellExecution",
          command: "bun run verify",
        }),
      ),
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(0);
    const output: unknown = JSON.parse(result.stdout.toString());
    expect(output).toEqual({ permission: "allow" });
  });

  test("recompõe JSON que o PowerShell enumerou caractere a caractere", () => {
    const json = JSON.stringify({
      hook_event_name: "beforeShellExecution",
      command: "bun run verify",
    });
    const result = Bun.spawnSync(["bun", RUNNER, "guard-shell.ts"], {
      cwd: FROM_SUBDIR,
      stdin: Buffer.from(json.split("").join("\n")),
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(0);
    const output: unknown = JSON.parse(result.stdout.toString());
    expect(output).toEqual({ permission: "allow" });
  });

  test("recusa path fora deste diretório", () => {
    const result = Bun.spawnSync(["bun", RUNNER, "../no-lint-suppression.ts"], {
      cwd: FROM_SUBDIR,
      stdin: Buffer.from("{}"),
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(1);
  });

  test("recusa o próprio launcher como alvo", () => {
    const result = Bun.spawnSync(["bun", RUNNER, "run-cursor-hook.ts"], {
      cwd: FROM_SUBDIR,
      stdin: Buffer.from("{}"),
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(1);
  });
});
