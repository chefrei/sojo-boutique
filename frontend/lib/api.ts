const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  
  const headers = new Headers(init.headers);
  
  if (auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("sojo_token") : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Asegurar que enviamos JSON por defecto
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Limpiar el endpoint para evitar dobles barras o barras al final si el backend es estricto
  const cleanEndpoint = endpoint.replace(/\/+$/, "").replace(/^\/+/, "");
  const url = `${API_BASE_URL}/${cleanEndpoint}`;
  
  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // Si el token expiró, podríamos redirigir al login
    // localStorage.removeItem("sojo_token");
    // window.location.href = "/login";
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error en la petición: ${response.status}`);
  }

  // Las respuestas 204 No Content (como DELETE) no tienen body — no llamar .json()
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null as unknown as T;
  }

  return response.json() as Promise<T>;
}
