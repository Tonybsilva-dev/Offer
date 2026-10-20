import type { ItemPayload } from "../domain/item-schema";

export function makeItemPayload(overrides: Partial<ItemPayload> = {}): ItemPayload {
  return {
    title: "Bicicleta",
    fullName: "Bicicleta Aro 29 Alumínio",
    brand: "Caloi",
    condition: "seminovo",
    status: "disponivel",
    description: "Pouco uso, revisada.",
    price: "1.500,00",
    isLot: false,
    isLowestPrice: false,
    acceptsTrade: true,
    tags: ["bike"],
    specs: [{ key: "Aro", value: "29" }],
    details: [{ title: "Retirada", content: "Lagoa de Roça, PB" }],
    mainImage: "mainimage01.jpg",
    images: [],
    ...overrides,
  };
}
