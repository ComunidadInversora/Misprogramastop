export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  stack: string[];
  status: string;
  forSale: boolean;
  price?: string;
  /** Ruta a una imagen en /public, ej. "/screenshots/dcf.png". Opcional. */
  screenshot?: string;
  /** URL de embed de YouTube (formato .../embed/ID), no listado si quieres. Opcional. */
  videoUrl?: string;
}

// Añadir un proyecto nuevo es solo añadir un objeto aquí — el resto de la
// página se genera solo.
export const projects: Project[] = [
  {
    slug: "screener-dcf",
    name: "Screener DCF",
    tagline: "Valoración de acciones por flujos de caja descontados",
    description:
      "Calcula el valor intrínseco de una acción con el método DCF: WACC vía CAPM, tres escenarios de crecimiento, DCF inverso y contraste por múltiplos. Los datos financieros se traen automáticamente de la SEC, sin depender de proveedores de pago.",
    url: "https://bolsa-y-finanzas.vercel.app",
    stack: ["Next.js", "Supabase", "SEC EDGAR", "Financial Modeling Prep"],
    status: "En producción",
    forSale: true,
    price: "700€",
  },
  {
    slug: "cartera-personal",
    name: "Cartera Personal",
    tagline: "Seguimiento de cartera y dividendos",
    description:
      "Registro de posiciones y operaciones, aristócratas del dividendo con columnas configurables, noticias relevantes filtradas por cartera, y una lista de seguimiento aparte de lo que ya tienes invertido.",
    url: "https://cartera-dividendos.vercel.app",
    stack: ["Next.js", "Supabase"],
    status: "En producción",
    forSale: true,
    price: "900€",
  },
  {
    slug: "truquo",
    name: "Truquo",
    tagline: "Marketplace de trueques sin dinero de por medio",
    description:
      "Publica objetos, propón intercambios y chatea en tiempo real con la otra persona. Un motor de coincidencias cruza lo que ofreces, lo que buscas, y lo que otros usuarios están dispuestos a aceptar a cambio.",
    url: "https://truquo.com",
    stack: ["JavaScript", "Supabase", "Panel de administración"],
    status: "En producción",
    forSale: true,
    price: "1.200€",
  },
];

export const paypalLink = "https://paypal.me/truquo";
export const contactEmail = "lacomunidadinversora@gmail.com";
