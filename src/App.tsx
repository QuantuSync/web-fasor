import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useMatches } from 'react-router-dom';
import { Head, type RouteRecord } from 'vite-react-ssg';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import { SITE_URL } from './config';

const DEFAULT_TITLE = 'FASOR, Fuerza de Auxilio, Soporte y Rescate';
const DEFAULT_DESCRIPTION =
  'FASOR, entidad sin ánimo de lucro de protección civil y respuesta ante emergencias impulsada por la Casa Alaniz.';

const OG_IMAGE = `${SITE_URL}/og/portada.png`;

type RouteMeta = { title: string; description: string; noindex?: boolean; nofollow?: boolean };

// Componente de carga para transiciones (fallback de Suspense)
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border border-fasor-gold border-t-transparent"></div>
      <p className="font-mono text-xs tracking-widest text-fasor-gold">CARGANDO...</p>
    </div>
  </div>
);

// Inyecta <title>/<meta> por ruta en el <head>, leyendo el `handle` de la ruta activa.
// Al renderizarse (no en useEffect), queda en el HTML pre-renderizado y react-helmet
// lo actualiza también al navegar en cliente.
function RouteHead() {
  const matches = useMatches();
  const location = useLocation();
  const meta = [...matches].reverse().find((m) => m.handle)?.handle as RouteMeta | undefined;
  const title = meta?.title ?? DEFAULT_TITLE;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;
  // Canonical por ruta sobre el dominio de producción ('/': con barra final)
  const canonical = location.pathname === '/' ? `${SITE_URL}/` : SITE_URL + location.pathname;
  // Directivas para buscadores; se omite la meta entera si la ruta es indexable
  const robots = [meta?.noindex && 'noindex', meta?.nofollow && 'nofollow']
    .filter(Boolean)
    .join(',');

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {robots && <meta name="robots" content={robots} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Sello de FASOR sobre fondo verde institucional" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}

// Scroll al inicio al cambiar de ruta (solo cliente; va en useEffect).
const useScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
};

// Elemento raíz: head por ruta + ErrorBoundary + Layout + Suspense con el Outlet.
function Root() {
  useScrollToTop();

  return (
    <ErrorBoundary>
      <RouteHead />
      <Layout>
        <React.Suspense fallback={<PageLoader />}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </React.Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

// Rutas en formato data-router para vite-react-ssg.
// Cada página se carga con `lazy`; el import directo permite al SSG detectar
// los estilos/recursos de cada ruta durante el build. El `handle` aporta el
// título/descripción que RouteHead inyecta en el <head> pre-renderizado.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        lazy: () => import('./pages/Home').then((m) => ({ Component: m.default })),
        handle: { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION } satisfies RouteMeta,
      },
      {
        path: 'unidades',
        lazy: () => import('./pages/Unidades').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Unidades · FASOR',
          description:
            'Las seis unidades especializadas de FASOR y sus áreas de actuación ante emergencias.',
        } satisfies RouteMeta,
      },
      {
        path: 'organizacion',
        lazy: () => import('./pages/Organizacion').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Organización · FASOR',
          description:
            'Estructura organizativa de FASOR, con el escalafón oficial, la Junta Directiva y los órganos de gobierno.',
        } satisfies RouteMeta,
      },
      {
        path: 'actuacion',
        lazy: () => import('./pages/Actuacion').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Actuación · FASOR',
          description:
            'Especialidades, entrenamiento, protocolo de activación y principios operativos de FASOR.',
        } satisfies RouteMeta,
      },
      {
        path: 'academy',
        lazy: () => import('./pages/Academy').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Academy · FASOR',
          description:
            'FASOR Academy, la plataforma formativa de FASOR, con itinerario de progresión gratuito, especialidades operativas y escuela abierta.',
        } satisfies RouteMeta,
      },
      {
        path: 'actualidad',
        lazy: () => import('./pages/Actualidad').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Actualidad · FASOR',
          description:
            'La actividad de FASOR, sus proyectos propios y las noticias de la entidad, con Abeiro como primer proyecto.',
        } satisfies RouteMeta,
      },
      {
        path: 'entidad',
        lazy: () => import('./pages/Entidad').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Entidad · FASOR',
          description:
            'Datos registrales, fines estatutarios y vínculo de FASOR con la Casa Alaniz.',
        } satisfies RouteMeta,
      },
      {
        path: 'abeiro',
        lazy: () => import('./pages/Abeiro').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Abeiro · FASOR',
          description:
            'Abeiro, el proyecto propio de FASOR de protección ante incendios forestales.',
        } satisfies RouteMeta,
      },
      {
        path: 'unete',
        lazy: () => import('./pages/Unete').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Únete · FASOR',
          description: 'Categorías de socios, derechos y deberes, y cómo ingresar en FASOR.',
        } satisfies RouteMeta,
      },
      {
        path: 'aviso-legal',
        lazy: () => import('./pages/AvisoLegal').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Aviso Legal · FASOR',
          description:
            'Aviso legal del sitio web de FASOR, con el titular, las condiciones de uso y la propiedad intelectual.',
        } satisfies RouteMeta,
      },
      {
        path: 'privacidad',
        lazy: () => import('./pages/Privacidad').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Política de Privacidad · FASOR',
          description:
            'Política de privacidad de FASOR. Qué datos tratamos, tanto los del formulario de ingreso como los de la zona interna, con qué base, y cuáles son tus derechos.',
        } satisfies RouteMeta,
      },
      // Zona interna. Única ruta que se renderiza en cliente (ver Enlace.tsx).
      // No va en el navbar ni en el sitemap, y se marca noindex,nofollow.
      {
        path: 'enlace',
        lazy: () => import('./pages/Enlace').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Enlace · FASOR',
          description: 'Zona interna de FASOR, reservada a los miembros de la entidad.',
          noindex: true,
          nofollow: true,
        } satisfies RouteMeta,
      },
      {
        path: '404',
        element: <NotFound />,
        handle: {
          title: 'Página no encontrada · FASOR',
          description: 'La página solicitada no existe en el sitio de FASOR.',
          noindex: true,
        } satisfies RouteMeta,
      },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
];
