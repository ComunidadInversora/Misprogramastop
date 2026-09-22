-- Ejecuta esto en el SQL Editor del MISMO proyecto de Supabase que ya usas
-- para el Screener DCF (no crees uno nuevo). Añade un schema "taller"
-- aparte, sin tocar nada de "dcf_tracker".

create schema if not exists taller;

create table if not exists taller.projects (
  slug text primary key,
  name text not null,
  tagline text not null,
  description text not null,
  url text not null,
  stack text[] not null default '{}',
  status text not null default 'En producción',
  for_sale boolean not null default true,
  price text,
  screenshot text,
  video_url text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table taller.projects enable row level security;

create policy "allow all on projects" on taller.projects
  for all using (true) with check (true);

grant usage on schema taller to anon, authenticated;
grant all on taller.projects to anon, authenticated;

-- Almacenamiento para las capturas subidas desde el panel de admin.
insert into storage.buckets (id, name, public)
values ('taller-screenshots', 'taller-screenshots', true)
on conflict (id) do nothing;

create policy "public read taller screenshots" on storage.objects
  for select using (bucket_id = 'taller-screenshots');
create policy "anon upload taller screenshots" on storage.objects
  for insert with check (bucket_id = 'taller-screenshots');
create policy "anon update taller screenshots" on storage.objects
  for update using (bucket_id = 'taller-screenshots');
create policy "anon delete taller screenshots" on storage.objects
  for delete using (bucket_id = 'taller-screenshots');

-- IMPORTANTE: si tu proyecto de Supabase ya tenía otros schemas expuestos
-- además de "dcf_tracker" (por ejemplo si metiste aquí también Cartera
-- Personal), añade sus nombres a la lista de abajo — este comando
-- REEMPLAZA la lista entera, no la completa.
alter role authenticator set pgrst.db_schemas = 'public, dcf_tracker, taller';
notify pgrst, 'reload config';

-- Datos de partida (los mismos que ya tenías a mano en el código).
insert into taller.projects (slug, name, tagline, description, url, stack, status, for_sale, price, screenshot, sort_order)
values
  (
    'screener-dcf',
    'Screener DCF',
    'Valoración de acciones por flujos de caja descontados',
    'Calcula el valor intrínseco de una acción con el método DCF: WACC vía CAPM, tres escenarios de crecimiento, DCF inverso y contraste por múltiplos. Los datos financieros se traen automáticamente de la SEC, sin depender de proveedores de pago.',
    'https://bolsa-y-finanzas.vercel.app',
    array['Next.js', 'Supabase', 'SEC EDGAR', 'Financial Modeling Prep'],
    'En producción',
    true,
    '700€',
    '/screenshots/dcf.png',
    1
  ),
  (
    'cartera-personal',
    'Cartera Personal',
    'Seguimiento de cartera y dividendos',
    'Registro de posiciones y operaciones, aristócratas del dividendo con columnas configurables, noticias relevantes filtradas por cartera, y una lista de seguimiento aparte de lo que ya tienes invertido.',
    'https://cartera-dividendos.vercel.app',
    array['Next.js', 'Supabase'],
    'En producción',
    true,
    '900€',
    '/screenshots/cartera.png',
    2
  ),
  (
    'truquo',
    'Truquo',
    'Marketplace de trueques sin dinero de por medio',
    'Publica objetos, propón intercambios y chatea en tiempo real con la otra persona. Un motor de coincidencias cruza lo que ofreces, lo que buscas, y lo que otros usuarios están dispuestos a aceptar a cambio.',
    'https://truquo.com',
    array['JavaScript', 'Supabase', 'Panel de administración'],
    'En producción',
    true,
    '1.200€',
    '/screenshots/truquo.png',
    3
  )
on conflict (slug) do nothing;
