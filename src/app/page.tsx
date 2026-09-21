export default function Home(): React.ReactNode {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full border border-foreground/15 px-3 py-1 font-mono text-xs tracking-wide text-foreground/60">
        Next.js 16 · React 19 · arquitetura imposta por lint
      </span>

      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        WJSD MultiSaaS
      </h1>

      <p className="max-w-xl text-lg text-pretty text-foreground/60">
        Base compartilhada dos produtos WJSD. RSC-puro, valibot nas bordas, ky em{" "}
        <code className="font-mono">lib/api</code>, sem barrel, sem cache. As regras vivem no lint e
        nas skills: veja <code className="font-mono">ARCHITECTURE.md</code> e{" "}
        <code className="font-mono">CLAUDE.md</code>.
      </p>
    </main>
  );
}
