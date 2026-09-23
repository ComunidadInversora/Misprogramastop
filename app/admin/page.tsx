"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Project } from "@/lib/supabase";

type Draft = Project & { stackText: string };

function toDraft(p: Project): Draft {
  return { ...p, stackText: p.stack.join(", ") };
}

const EMPTY = (): Draft => ({
  slug: "",
  name: "",
  tagline: "",
  description: "",
  url: "",
  stack: [],
  stackText: "",
  status: "En producción",
  for_sale: true,
  price: "",
  screenshots: [],
  video_url: null,
  sort_order: 0,
  updated_at: new Date().toISOString(),
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs mb-1" style={{ color: "var(--fg-soft)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-sm px-3 py-2 text-sm";
const inputStyle = { background: "var(--ink)", border: "1px solid var(--line)", color: "var(--fg)" };

export default function AdminPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
    if (fetchError) setError(fetchError.message);
    else setDrafts(((data as Project[]) ?? []).map(toDraft));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateDraft(slug: string, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d) => (d.slug === slug ? { ...d, ...patch } : d)));
  }

  async function saveDraft(draft: Draft) {
    if (!draft.slug.trim()) {
      alert("El slug no puede estar vacío (es el identificador único, ej. 'screener-dcf').");
      return;
    }
    setSavingSlug(draft.slug);
    setMsg(null);
    const { stackText, ...rest } = draft;
    const row: Project = {
      ...rest,
      stack: stackText.split(",").map((s) => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await supabase.from("projects").upsert(row, { onConflict: "slug" });
    setSavingSlug(null);
    if (saveError) {
      alert(`Error al guardar: ${saveError.message}`);
      return;
    }
    setMsg(`"${row.name || row.slug}" guardado.`);
    load();
  }

  async function deleteDraft(slug: string) {
    if (!confirm(`¿Seguro que quieres borrar "${slug}"? No se puede deshacer.`)) return;
    const { error: deleteError } = await supabase.from("projects").delete().eq("slug", slug);
    if (deleteError) {
      alert(`Error al borrar: ${deleteError.message}`);
      return;
    }
    load();
  }

  async function uploadScreenshots(slug: string, files: FileList) {
    setUploadingSlug(slug);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          alert(`Error al subir "${file.name}": ${data.error ?? "desconocido"}`);
          continue;
        }
        uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) {
        setDrafts((prev) =>
          prev.map((d) => (d.slug === slug ? { ...d, screenshots: [...d.screenshots, ...uploadedUrls] } : d))
        );
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setUploadingSlug(null);
    }
  }

  function removeScreenshot(slug: string, index: number) {
    setDrafts((prev) =>
      prev.map((d) => (d.slug === slug ? { ...d, screenshots: d.screenshots.filter((_, i) => i !== index) } : d))
    );
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function addNew() {
    setDrafts((prev) => [...prev, EMPTY()]);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs mb-1" style={{ color: "var(--accent)" }}>
              Taller — admin
            </p>
            <h1 className="font-display text-2xl font-semibold">Proyectos</h1>
          </div>
          <button onClick={logout} className="text-xs underline" style={{ color: "var(--fg-soft)" }}>
            Cerrar sesión
          </button>
        </div>

        {msg && (
          <p className="text-xs mb-4" style={{ color: "var(--accent)" }}>
            {msg}
          </p>
        )}
        {error && (
          <p className="text-xs mb-4" style={{ color: "var(--stamp)" }}>
            {error}
          </p>
        )}
        {loading && (
          <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
            Cargando…
          </p>
        )}

        <div className="flex flex-col gap-6">
          {drafts.map((d) => (
            <div key={d.slug || Math.random()} className="rounded-md p-5" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Field label="Slug (identificador único, sin espacios)">
                  <input
                    value={d.slug}
                    onChange={(e) => updateDraft(d.slug, { slug: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Nombre">
                  <input value={d.name} onChange={(e) => updateDraft(d.slug, { name: e.target.value })} className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <Field label="Frase corta (tagline)">
                <input value={d.tagline} onChange={(e) => updateDraft(d.slug, { tagline: e.target.value })} className={inputCls} style={inputStyle} />
              </Field>

              <Field label="Descripción">
                <textarea
                  value={d.description}
                  onChange={(e) => updateDraft(d.slug, { description: e.target.value })}
                  rows={3}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Field label="URL (demo en vivo)">
                  <input value={d.url} onChange={(e) => updateDraft(d.slug, { url: e.target.value })} className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Precio (ej. 700€, deja vacío si no aplica)">
                  <input
                    value={d.price ?? ""}
                    onChange={(e) => updateDraft(d.slug, { price: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Stack (separado por comas)">
                <input
                  value={d.stackText}
                  onChange={(e) => updateDraft(d.slug, { stackText: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Field label="Estado (ej. En producción)">
                  <input value={d.status} onChange={(e) => updateDraft(d.slug, { status: e.target.value })} className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Orden (0 primero)">
                  <input
                    type="number"
                    value={d.sort_order}
                    onChange={(e) => updateDraft(d.slug, { sort_order: parseInt(e.target.value, 10) || 0 })}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Vídeo (URL de embed de YouTube, ej. https://www.youtube.com/embed/XXXX)">
                <input
                  value={d.video_url ?? ""}
                  onChange={(e) => updateDraft(d.slug, { video_url: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              <label className="flex items-center gap-2 mb-4 text-sm">
                <input type="checkbox" checked={d.for_sale} onChange={(e) => updateDraft(d.slug, { for_sale: e.target.checked })} />
                En venta (muestra el sello y el botón de PayPal)
              </label>

              <div className="mb-4">
                <span className="block text-xs mb-1.5" style={{ color: "var(--fg-soft)" }}>
                  Capturas de pantalla (la primera es la principal — arrastra reordenando no está soportado, borra y resube en el orden que quieras)
                </span>
                {d.screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {d.screenshots.map((src, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-24 rounded-sm" style={{ border: "1px solid var(--line)" }} />
                        <button
                          onClick={() => removeScreenshot(d.slug, i)}
                          className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center"
                          style={{ background: "var(--stamp)", color: "#1a1204" }}
                          title="Quitar esta imagen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingSlug === d.slug || !d.slug}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) uploadScreenshots(d.slug, e.target.files);
                    e.target.value = "";
                  }}
                  className="text-xs"
                />
                {uploadingSlug === d.slug && (
                  <span className="text-xs ml-2" style={{ color: "var(--fg-soft)" }}>
                    Subiendo…
                  </span>
                )}
                {!d.slug && (
                  <p className="text-[11px] mt-1" style={{ color: "var(--stamp)" }}>
                    Escribe el slug antes de subir la imagen.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveDraft(d)}
                  disabled={savingSlug === d.slug}
                  className="text-sm px-4 py-2 rounded-sm font-medium disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "#0a1a17" }}
                >
                  {savingSlug === d.slug ? "Guardando…" : "Guardar"}
                </button>
                <button onClick={() => deleteDraft(d.slug)} className="text-xs underline" style={{ color: "var(--stamp)" }}>
                  Borrar proyecto
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addNew}
          className="mt-6 text-sm px-4 py-2 rounded-sm"
          style={{ border: "1px dashed var(--accent)", color: "var(--accent)" }}
        >
          + Nuevo proyecto
        </button>
      </div>
    </main>
  );
}
