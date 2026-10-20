import type { MetadataRoute } from "next";
import { env } from "@/shared/server/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = env.siteUrl().replace(/\/+$/, "");
  return {
    // As fotos dos itens são servidas por /api/images; o resto da API e o painel ficam fora dos buscadores.
    rules: { userAgent: "*", allow: ["/", "/api/images/"], disallow: ["/admin", "/api/"] },
    ...(siteUrl && { sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl }),
  };
}
