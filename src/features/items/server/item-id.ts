import { customAlphabet } from "nanoid";

/** IDs curtos e legíveis para URL e mensagem do WhatsApp. */
export const generateItemId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);
