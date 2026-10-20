import { allImages, type Item } from "../../domain/item";
import { imageUrl } from "../../image-url";

const AVAILABILITY = {
  disponivel: "https://schema.org/InStock",
  reservado: "https://schema.org/OutOfStock",
  vendido: "https://schema.org/SoldOut",
} as const;

const CONDITION = {
  novo: "https://schema.org/NewCondition",
  seminovo: "https://schema.org/UsedCondition",
  usado: "https://schema.org/UsedCondition",
  "com-defeito": "https://schema.org/DamagedCondition",
} as const;

/** Dados estruturados (schema.org/Product) para os buscadores exibirem preço e disponibilidade. */
export function ItemJsonLd({ item, baseUrl }: { item: Item; baseUrl: string }) {
  const base = baseUrl.replace(/\/+$/, "");
  const url = `${base}/item/${item.id}`;
  // Lote de itens diversos com valor 0 não tem preço único: publicar R$ 0,00 seria enganoso.
  const hasPrice = item.priceCents > 0;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.fullName || item.title,
    description: item.description || undefined,
    brand: { "@type": "Brand", name: item.brand },
    image: allImages(item).map((name) => `${base}${imageUrl(name)}`),
    sku: item.id,
    url,
    itemCondition: CONDITION[item.condition],
    ...(hasPrice && {
      offers: {
        "@type": "Offer",
        url,
        price: (item.priceCents / 100).toFixed(2),
        priceCurrency: "BRL",
        availability: AVAILABILITY[item.status],
      },
    }),
  };

  // "<" escapado para o JSON nunca fechar a tag <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
