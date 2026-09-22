"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <p className="font-mono text-xs mb-2" style={{ color: "var(--accent)" }}>
          Taller — admin
        </p>
        <h1 className="font-display text-2xl font-semibold mb-6">Iniciar sesión</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          className="w-full rounded-sm px-3 py-2 mb-3 text-sm"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--fg)" }}
        />
        {error && (
          <p className="text-xs mb-3" style={{ color: "var(--stamp)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm px-4 py-2 rounded-sm font-medium disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#0a1a17" }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
