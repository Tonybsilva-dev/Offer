import "server-only";
import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ImageStore } from "./image-store";

type R2Config = { endpoint: string; accessKeyId: string; secretAccessKey: string; bucket: string; prefix: string };

export class R2ImageStore implements ImageStore {
  private client: S3Client;

  constructor(private config: R2Config) {
    this.client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }

  private key(name: string) {
    return `${this.config.prefix}${name}`;
  }

  async put(name: string, data: Uint8Array, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: this.key(name),
        Body: data,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  async get(name: string) {
    try {
      const object = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: this.key(name) }));
      if (!object.Body) return null;
      return { data: await object.Body.transformToByteArray(), contentType: object.ContentType ?? "application/octet-stream" };
    } catch (error) {
      if (error instanceof NoSuchKey) return null;
      throw error;
    }
  }
}
