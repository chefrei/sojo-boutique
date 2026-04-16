/**
 * Rutas de Upload — /api/v1/upload
 *
 * Endpoints:
 *   POST / — Subir una imagen a Cloudflare R2
 */

import { Hono } from "hono";
import type { Env, AppVariables } from "../types";

const uploadRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

/**
 * POST /
 * Sube una imagen a Cloudflare R2 (o retorna error si no hay bucket).
 *
 * Acepta multipart/form-data con un campo 'file'.
 * Respuestas:
 *   201: { filename, image_url, storage: "r2" }
 *   400: Archivo no es una imagen.
 *   500: Error al subir.
 */
uploadRouter.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    return c.json(
      { detail: "Se requiere un archivo en el campo 'file'." },
      400
    );
  }

  // Validar que sea una imagen
  if (!file.type.startsWith("image/")) {
    return c.json(
      { detail: "El archivo proporcionado no es una imagen." },
      400
    );
  }

  // Generar nombre único
  const fileExtension = file.name.split(".").pop() || "jpg";
  const uniqueFilename = `${crypto.randomUUID().replace(/-/g, "")}.${fileExtension}`;

  // Subir a R2
  const r2Bucket = c.env.R2_BUCKET;
  if (!r2Bucket) {
    return c.json(
      { detail: "Bucket R2 no configurado. Revisa wrangler.toml." },
      500
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    await r2Bucket.put(uniqueFilename, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    const imageUrl = `/images/productos/${uniqueFilename}`;

    return c.json(
      {
        filename: uniqueFilename,
        image_url: imageUrl,
        storage: "r2",
      },
      201
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return c.json(
      { detail: `Fallo al guardar la imagen en R2: ${message}` },
      500
    );
  }
});

export default uploadRouter;
