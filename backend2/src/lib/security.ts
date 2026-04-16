/**
 * Funciones de seguridad para Soho Boutique API.
 *
 * Implementa hashing de contraseñas (PBKDF2-SHA256) y JWT (HS256)
 * usando exclusivamente la Web Crypto API, compatible con Cloudflare Workers
 * sin dependencias externas.
 */

// ─── Configuración ──────────────────────────────────────

const PBKDF2_ITERATIONS = 29000;
const HASH_ALGORITHM = "SHA-256";
const SALT_LENGTH = 16; // bytes
const KEY_LENGTH = 32; // bytes (256 bits)

const JWT_ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 7; // 7 días

// ─── Helpers ────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

// ─── Password Hashing (PBKDF2-SHA256) ──────────────────

/**
 * Genera un hash PBKDF2-SHA256 de la contraseña.
 * Formato: $pbkdf2-sha256$iterations$salt_b64$hash_b64
 * (Compatible conceptualmente con passlib, pero formato propio)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltB64 = arrayBufferToBase64(salt.buffer);
  const hashB64 = arrayBufferToBase64(derivedBits);

  return `$pbkdf2-sha256$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

/**
 * Verifica una contraseña contra un hash almacenado.
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  // Format: $pbkdf2-sha256$iterations$salt$hash
  if (parts.length !== 5 || parts[1] !== "pbkdf2-sha256") {
    return false;
  }

  const iterations = parseInt(parts[2], 10);
  const salt = base64ToArrayBuffer(parts[3]);
  const expectedHash = parts[4];

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(plainPassword),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const computedHash = arrayBufferToBase64(derivedBits);
  return computedHash === expectedHash;
}

// ─── JWT (HS256) ────────────────────────────────────────

/**
 * Crea un JWT con HS256 usando la Web Crypto API.
 * @param subject — Generalmente el email del usuario.
 * @param secret — Clave secreta JWT.
 * @param expiresInMinutes — Tiempo de expiración en minutos.
 */
export async function createAccessToken(
  subject: string,
  secret: string,
  expiresInMinutes: number = ACCESS_TOKEN_EXPIRE_MINUTES
): Promise<string> {
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    sub: subject,
    exp: now + expiresInMinutes * 60,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  const encodedSignature = arrayBufferToBase64(signature)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${data}.${encodedSignature}`;
}

/**
 * Decodifica y valida un JWT. Retorna el payload si es válido, null si no.
 */
export async function decodeToken(
  token: string,
  secret: string
): Promise<{ sub: string; exp: number; iat: number } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    // Verificar firma
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decodificar la firma de base64url
    const sigPadded =
      encodedSignature + "=".repeat((4 - (encodedSignature.length % 4)) % 4);
    const sigBinary = atob(sigPadded.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer,
      encoder.encode(data)
    );

    if (!isValid) return null;

    // Decodificar payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
