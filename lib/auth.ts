// Sesión de admin muy simple: una cookie cuyo valor es el hash de la
// contraseña (guardada en la variable de entorno ADMIN_PASSWORD). No es un
// sistema de login de usuarios múltiples — es solo para que tú, y nadie más,
// puedas entrar a /admin.

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getExpectedSessionValue(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  return sha256(`taller-admin:${password}`);
}

export const ADMIN_COOKIE_NAME = "admin_session";
