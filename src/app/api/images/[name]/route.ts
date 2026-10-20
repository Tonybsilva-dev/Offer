import { readImage } from "@/features/uploads/server/image-storage";
import { jsonError } from "@/shared/server/http";

export async function GET(_request: Request, ctx: RouteContext<"/api/images/[name]">) {
  const { name } = await ctx.params;
  const image = await readImage(name);
  if (!image) return jsonError(404, "Imagem não encontrada");

  return new Response(image.data as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
