import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { itemRepository } from "@/features/items/server/container";
import { getBaseUrl } from "@/shared/server/base-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = (await getBaseUrl()).replace(/\/+$/, "");
  const items = await itemRepository().list();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...items
      .filter((item) => item.status !== "vendido")
      .map((item) => ({
        url: `${base}/item/${item.id}`,
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  ];
}
