import { registerOTel } from "@vercel/otel";

/**
 * Envia traces para o coletor OTLP quando `OTEL_EXPORTER_OTLP_ENDPOINT` está definido
 * (produção). Sem endpoint — desenvolvimento, testes e CI — não registra nada.
 * Destino, protocolo e credenciais vêm das variáveis `OTEL_*` padrão.
 */
export function register() {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
  registerOTel({ serviceName: process.env.OTEL_SERVICE_NAME || "offer-web" });
}
