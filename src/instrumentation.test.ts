import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const registerOTel = vi.fn();
vi.mock("@vercel/otel", () => ({ registerOTel }));

describe("instrumentation", () => {
  beforeEach(() => {
    registerOTel.mockClear();
    vi.unstubAllEnvs();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("não registra nada sem endpoint OTLP", async () => {
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "");
    const { register } = await import("./instrumentation");
    register();
    expect(registerOTel).not.toHaveBeenCalled();
  });

  it("registra com o nome de serviço padrão quando há endpoint", async () => {
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://coletor:4140/api/org");
    vi.stubEnv("OTEL_SERVICE_NAME", "");
    const { register } = await import("./instrumentation");
    register();
    expect(registerOTel).toHaveBeenCalledWith({ serviceName: "offer-web" });
  });

  it("usa OTEL_SERVICE_NAME quando definido", async () => {
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://coletor:4140/api/org");
    vi.stubEnv("OTEL_SERVICE_NAME", "offer-web-production");
    const { register } = await import("./instrumentation");
    register();
    expect(registerOTel).toHaveBeenCalledWith({ serviceName: "offer-web-production" });
  });
});
