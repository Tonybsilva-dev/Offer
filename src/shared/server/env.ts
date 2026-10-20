import "server-only";

function read(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  adminPassword: () => read("ADMIN_PASSWORD"),
  sessionSecret: () => {
    const secret = read("SESSION_SECRET");
    if (secret.length < 32) throw new Error("SESSION_SECRET ausente ou com menos de 32 caracteres");
    return secret;
  },
  whatsappNumber: () => read("WHATSAPP_NUMBER"),
  siteUrl: () => read("NEXT_PUBLIC_SITE_URL"),
  databaseUrl: () => read("DATABASE_URL"),
  databaseSsl: () => read("DATABASE_SSL") === "true",
  r2: () => {
    const config = {
      endpoint: read("R2_ENDPOINT"),
      accessKeyId: read("R2_ACCESS_KEY"),
      secretAccessKey: read("R2_SECRET_KEY"),
      bucket: read("R2_BUCKET_NAME"),
      prefix: read("R2_PREFIX", "bazar/"),
    };
    const configured = config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucket;
    return configured ? config : null;
  },
};
