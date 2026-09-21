import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  // Shell estático + buraco dinâmico em streaming. NÃO é cache: cada request
  // busca fresco; o que fica pré-renderizado é só a casca sem dado. A parte que
  // lê cookie/dado precisa ficar sob um `<Suspense>` (ver src/app/perfil/page.tsx).
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    turbopackRustReactCompiler: true,
    useTypeScriptCli: true,
  },
  productionBrowserSourceMaps: false,
  output: "standalone",
  images: {
    minimumCacheTTL: 86_400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Proxy same-origin somente em desenvolvimento. Com `/` (o padrão do
  // template), não há destino externo e portanto não criamos um rewrite
  // recursivo para o próprio app.
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (process.env.NODE_ENV === "production" || !apiBaseUrl || apiBaseUrl === "/") {
      return [];
    }

    return [{ source: "/api/:path*", destination: `${apiBaseUrl}/api/:path*` }];
  },
};

export default nextConfig;
