import { existsSync } from "node:fs";
import { join } from "node:path";

/** Nome de hook neste diretório: arquivo .ts, sem path. */
const HOOK_NAME_PATTERN = /^[a-z0-9][a-z0-9.-]*\.ts$/i;

/**
 * Recompõe o JSON que o PowerShell do Cursor costuma desmontar.
 *
 * O host dispara `$input | bun …`. Se `$input` é string, o pipeline enumera
 * caractere a caractere (um por linha) e o `JSON.parse` falha. Espaço em JSON
 * não é significativo: juntar de novo é seguro. Nulos no meio são UTF-16
 * lido como texto.
 *
 * @param text - Bytes do stdin, já decodificados.
 * @returns JSON válido, ou o texto original se não der para reparar.
 */
function repairHookJson(text: string): string {
  const withoutNul = text.replaceAll("\u0000", "").replace(/^\uFEFF/, "");
  const trimmed = withoutNul.trim();
  if (trimmed.length === 0) {
    return "{}";
  }
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    const compacted = withoutNul.replace(/\r?\n/g, "").trim();
    try {
      JSON.parse(compacted);
      return compacted;
    } catch {
      return trimmed;
    }
  }
}

/**
 * Dispara um hook compartilhado sem sintaxe bash.
 *
 * Lê e repara o stdin neste processo, depois chama o hook num `bun` filho com
 * o JSON já válido — um segundo processo evita o stdin já ter sido consumido.
 *
 * @param scriptName - Arquivo em `tooling/agent-hooks/` (ex.: `guard-shell.ts`).
 */
async function runCursorHook(scriptName: string): Promise<void> {
  if (!HOOK_NAME_PATTERN.test(scriptName) || scriptName === "run-cursor-hook.ts") {
    console.error("run-cursor-hook: informe só o nome do hook (ex.: guard-shell.ts).");
    process.exit(1);
  }

  const scriptPath = join(import.meta.dir, scriptName);
  if (!existsSync(scriptPath)) {
    console.error(`run-cursor-hook: hook não encontrado: ${scriptName}`);
    process.exit(1);
  }

  const payload = repairHookJson(await Bun.stdin.text());
  const child = Bun.spawn(["bun", scriptPath], {
    stdin: new Blob([payload]),
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      AGENT_HOOK_SURFACE: "cursor",
    },
  });
  process.exit(await child.exited);
}

const scriptName = process.argv.at(2);
if (scriptName === undefined) {
  console.error("run-cursor-hook: falta o nome do hook.");
  process.exit(1);
}

await runCursorHook(scriptName);
