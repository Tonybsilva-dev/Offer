import { z } from "zod";
import { ITEM_CONDITIONS, ITEM_STATUSES, type ItemInput } from "./item";
import { IMAGE_NAME_PATTERN, ITEM_LIMITS as L } from "./limits";
import { parsePriceToCents } from "./price";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) =>
  z.string().trim().min(1, `${label} é obrigatório`).max(max, `${label}: máximo de ${max} caracteres`);

const imageName = z.string().regex(IMAGE_NAME_PATTERN, "Imagem inválida");

const specSchema = z.object({ key: required(60, "Chave"), value: required(300, "Valor") });
const detailSchema = z.object({ title: required(80, "Título da seção"), content: required(3000, "Conteúdo") });

const conditionKeys = Object.keys(ITEM_CONDITIONS) as [keyof typeof ITEM_CONDITIONS];
const statusKeys = Object.keys(ITEM_STATUSES) as [keyof typeof ITEM_STATUSES];

export const itemInputSchema = z
  .object({
    title: required(L.titleMax, "Título"),
    fullName: text(L.fullNameMax).default(""),
    brand: required(L.brandMax, "Marca"),
    condition: z.enum(conditionKeys),
    status: z.enum(statusKeys).default("disponivel"),
    description: text(L.descriptionMax).default(""),
    price: z.union([z.string(), z.number()]).default(""),
    isLot: z.boolean().default(false),
    isLowestPrice: z.boolean().default(false),
    acceptsTrade: z.boolean().default(false),
    tags: z.array(required(L.tagMax, "Tag")).max(L.tagsMax).default([]),
    specs: z.array(specSchema).max(L.specsMax).default([]),
    details: z.array(detailSchema).max(L.detailsMax).default([]),
    mainImage: imageName,
    images: z.array(imageName).max(L.extraImagesMax, `Máximo de ${L.extraImagesMax} imagens adicionais`).default([]),
  })
  .superRefine((data, ctx) => {
    if (parsePriceToCents(data.price, { allowZero: data.isLot }) === null) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Valor inválido" });
    }
    const seen = new Set<string>();
    data.specs.forEach((spec, index) => {
      const key = spec.key.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["specs", index, "key"], message: `Chave repetida: ${spec.key}` });
      }
      seen.add(key);
    });
  })
  .transform(({ price, tags, images, mainImage, ...rest }): ItemInput => ({
    ...rest,
    mainImage,
    priceCents: parsePriceToCents(price, { allowZero: rest.isLot }) as number,
    tags: [...new Set(tags.map((tag) => tag.toLowerCase()))],
    images: images.filter((name) => name !== mainImage),
  }));

export type ItemPayload = z.input<typeof itemInputSchema>;

export function parseItemInput(data: unknown) {
  const result = itemInputSchema.safeParse(data);
  if (result.success) return { ok: true as const, value: result.data };
  const errors = result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
  return { ok: false as const, errors };
}
