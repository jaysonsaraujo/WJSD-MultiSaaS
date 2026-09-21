/**
 * Guard do `verify`: proíbe diretivas de supressão de lint do ESLint e do oxlint
 * no código-fonte. Toda ocorrência deve ser corrigida na origem; não há escape
 * hatch porque uma supressão permitiria burlar os guardrails com o gate verde.
 *
 * Não é uma regra do plugin oxlint de propósito: uma regra de lint pode ser
 * desligada pela própria diretiva que ela proíbe. Um grep fora do linter, não.
 *
 * Roda em Bun (sem node). Usa `git grep` quando há repositório (rápido e já
 * respeita o .gitignore) e cai pro `grep` recursivo quando ainda não há — o
 * comprador extrai o zip e roda `bun run verify` antes do `git init`.
 * Sai 1 se achar ocorrência ou se a busca falhar de verdade.
 */

// Montados em runtime pra este próprio arquivo não dar auto-match na busca.
const NEEDLES = [["eslint", "disable"].join("-"), ["oxlint", "disable"].join("-")];

const EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts"];

const isGitRepository =
  Bun.spawnSync(["git", "rev-parse", "--is-inside-work-tree"], {
    stdout: "pipe",
    stderr: "pipe",
  }).exitCode === 0;

const command = isGitRepository
  ? [
      "git",
      "grep",
      "-nI",
      ...NEEDLES.flatMap((needle) => ["-e", needle]),
      "--",
      ...EXTENSIONS.map((extension) => `*.${extension}`),
    ]
  : [
      "grep",
      "-rnI",
      ...NEEDLES.flatMap((needle) => ["-e", needle]),
      ...EXTENSIONS.map((extension) => `--include=*.${extension}`),
      "--exclude-dir=node_modules",
      "--exclude-dir=.next",
      ".",
    ];

const result = Bun.spawnSync(command, { stdout: "pipe", stderr: "pipe" });

// Exit 1 nas duas ferramentas significa só "nenhuma ocorrência".
if (result.exitCode > 1) {
  const details = result.stderr.toString().trim();
  process.stderr.write(
    `Proibido continuar: a busca por supressões falhou (exit ${result.exitCode}).\n${details}\n`,
  );
  process.exit(1);
}

const hits = result.stdout.toString().trim();
if (hits) {
  process.stderr.write(
    `Proibido: diretiva de supressão de lint encontrada no código-fonte:\n${hits}\n` +
      "Corrija a causa do lint; supressões não são permitidas.\n",
  );
  process.exit(1);
}
