export const ITEM_CONDITIONS = {
  novo: "Novo",
  seminovo: "Seminovo",
  usado: "Usado",
  "com-defeito": "Com defeito",
} as const;

export const ITEM_STATUSES = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
} as const;

export type ItemCondition = keyof typeof ITEM_CONDITIONS;
export type ItemStatus = keyof typeof ITEM_STATUSES;

export type ItemSpec = { key: string; value: string };
export type ItemDetail = { title: string; content: string };

export type Item = {
  id: string;
  title: string;
  fullName: string;
  brand: string;
  condition: ItemCondition;
  status: ItemStatus;
  description: string;
  priceCents: number;
  isLot: boolean;
  isLowestPrice: boolean;
  acceptsTrade: boolean;
  tags: string[];
  specs: ItemSpec[];
  details: ItemDetail[];
  mainImage: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ItemInput = Omit<Item, "id" | "createdAt" | "updatedAt">;

export function allImages(item: Pick<Item, "mainImage" | "images">) {
  return [item.mainImage, ...item.images];
}
