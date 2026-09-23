import { supabase, isSupabaseConfigured, paypalLink, contactEmail, type Project } from "@/lib/supabase";

// Siempre trae los datos frescos de Supabase (no cachea la página estática),
// así los cambios desde /admin se ven al instante sin esperar a un redeploy.
export const dynamic = "force-dynamic";

function SaleStamp() {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 select-none" style={{ transform: "rotate(-7deg)" }} aria-hidden>
      <div
        className="font-mono text-[10px] sm:text-xs tracking-wide px-2.5 py-1 rounded-sm"
        style={{ color: "var(--stamp)", border: "1.5px solid var(--stamp)" }}
      >
        EN VENTA
      </div>
    </div>
  );
}

function ProjectDossier({ name, tagline, description, url, stack, status, for_sale, price, screenshots, video_url }: Project) {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <article className="relative rounded-md p-6 sm:p-8" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
      {for_sale && <SaleStamp />}

      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-1.5 pr-20">{name}</h2>
        <p className="text-sm sm:text-base mb-4" style={{ color: "var(--fg-soft)" }}>
          {tagline}
        </p>

        {screenshots.length > 0 && (
          <div className="mb-5">
            <a href={screenshots[0]} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshots[0]}
                alt={`Captura de ${name}`}
                className="w-full rounded-sm cursor-zoom-in"
                style={{ border: "1px solid var(--line)" }}
              />
            </a>
            {screenshots.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {screenshots.slice(1).map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Captura ${i + 2} de ${name}`}
                      className="h-20 rounded-sm cursor-zoom-in"
                      style={{ border: "1px solid var(--line)" }}
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {video_url ? (
          <div className="mb-5 rounded-sm overflow-hidden" style={{ border: "1px solid var(--line)", aspectRatio: "16/9" }}>
            <iframe
              src={video_url}
              className="w-full h-full"
              title={`Vídeo de ${name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="mb-5 rounded-sm flex items-center justify-center font-mono text-xs"
            style={{ border: "1px dashed var(--accent)", color: "var(--fg-soft)", aspectRatio: "16/9" }}
          >
            Vídeo pendiente (enlace de YouTube)
          </div>
        )}

        <p className="text-sm sm:text-[15px] leading-relaxed mb-6" style={{ color: "var(--fg)" }}>
          {description}
        </p>

        <div className="font-mono text-[11px] sm:text-xs mb-6" style={{ color: "var(--fg-soft)" }}>
          {stack.join(" · ")}
          <span style={{ color: "var(--line)" }}> — </span>
          {status}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-4 decoration-1"
            style={{ color: "var(--accent)", textDecorationColor: "var(--accent)" }}
          >
            Abrir {host}
          </a>

          {for_sale && (
            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-sm font-medium"
              style={{ background: "var(--stamp)", color: "#1a1204" }}
            >
              Comprar por PayPal{price ? ` — ${price}` : ""}
            </a>
          )}
        </div>

        {for_sale && (
          <p className="text-xs" style={{ color: "var(--fg-soft)" }}>
            Tras el pago te escribo a tu email de PayPal con el acceso al código y las instrucciones de instalación.{" "}
            <a href={`mailto:${contactEmail}`} className="underline" style={{ color: "var(--fg-soft)" }}>
              ¿Dudas antes de comprar?
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

export default async function Home() {
  let projects: Project[] = [];
  let error: string | null = null;

  if (!isSupabaseConfigured) {
    error = "Faltan las variables de entorno de Supabase.";
  } else {
    const { data, error: fetchError } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
    if (fetchError) error = fetchError.message;
    else projects = (data as Project[]) ?? [];
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-14 sm:mb-20">
          <p className="font-mono text-xs mb-3" style={{ color: "var(--accent)" }}>
            Taller
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight mb-4 max-w-md">
            Herramientas que construyo para resolver mis propios problemas
          </h1>
          <p className="text-sm sm:text-base max-w-md" style={{ color: "var(--fg-soft)" }}>
            Todas están en producción y en uso. Si alguna te sirve para lo tuyo, están disponibles.
          </p>
        </header>

        {error && (
          <p className="text-sm mb-8" style={{ color: "var(--stamp)" }}>
            Error al cargar los proyectos: {error}
          </p>
        )}

        <div className="flex flex-col gap-6 sm:gap-8">
          {projects.map((p) => (
            <ProjectDossier key={p.slug} {...p} />
          ))}
        </div>

        <footer className="mt-16 sm:mt-20 pt-6" style={{ borderTop: "1px solid var(--line)" }}>
          <p className="text-xs" style={{ color: "var(--fg-soft)" }}>
            ¿Preguntas sobre cualquiera de los proyectos?{" "}
            <a href={`mailto:${contactEmail}`} className="underline" style={{ color: "var(--fg-soft)" }}>
              {contactEmail}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
