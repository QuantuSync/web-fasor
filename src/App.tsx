import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useMatches } from 'react-router-dom';
import { Siren } from 'lucide-react';
import { Head, type RouteRecord } from 'vite-react-ssg';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const DEFAULT_TITLE = 'FASOR - Fuerza de Auxilio, Soporte y Rescate';
const DEFAULT_DESCRIPTION =
  'FASOR, asociación sin ánimo de lucro de protección civil y respuesta ante emergencias impulsada por la Casa Alaniz.';

type RouteMeta = { title: string; description: string };

// Componente de carga para transiciones (fallback de Suspense)
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-alanizGold-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-alanizGold-600 font-medium">Cargando página...</p>
    </div>
  </div>
);

// Inyecta <title>/<meta> por ruta en el <head>, leyendo el `handle` de la ruta activa.
// Al renderizarse (no en useEffect), queda en el HTML pre-renderizado y react-helmet
// lo actualiza también al navegar en cliente.
function RouteHead() {
  const matches = useMatches();
  const meta = [...matches].reverse().find((m) => m.handle)?.handle as RouteMeta | undefined;
  const title = meta?.title ?? DEFAULT_TITLE;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
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

// Página 404 (versión mínima; la página temática completa llega en la fase 3)
const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="stack-centered space-y-5">
      <Siren className="h-24 w-24 text-alanizGold-600" aria-hidden="true" />
      <h1 className="font-display text-3xl font-bold text-alanizGold-600">Página No Encontrada</h1>
      <p className="max-w-md text-parchment-300">
        La página que buscas no existe en el sitio de FASOR.
      </p>
      <div className="space-x-4">
        <button onClick={() => window.history.back()} className="btn-secondary">
          Volver Atrás
        </button>
        <button onClick={() => (window.location.href = '/')} className="btn-alaniz">
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
);

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
          title: 'Unidades - FASOR',
          description:
            'Las cinco unidades especializadas de FASOR y sus áreas de actuación ante emergencias.',
        } satisfies RouteMeta,
      },
      {
        path: 'organizacion',
        lazy: () => import('./pages/Organizacion').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Organización - FASOR',
          description:
            'Estructura organizativa de FASOR: escalafón oficial, Junta Directiva y órganos de gobierno.',
        } satisfies RouteMeta,
      },
      {
        path: 'actuacion',
        lazy: () => import('./pages/Actuacion').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Actuación - FASOR',
          description:
            'Especialidades, entrenamiento, protocolo de activación y principios operativos de FASOR.',
        } satisfies RouteMeta,
      },
      {
        path: 'entidad',
        lazy: () => import('./pages/Entidad').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Entidad - FASOR',
          description:
            'Datos registrales, fines estatutarios y vínculo de FASOR con la Casa Alaniz.',
        } satisfies RouteMeta,
      },
      {
        path: 'abeiro',
        lazy: () => import('./pages/Abeiro').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Abeiro - FASOR',
          description:
            'Abeiro, el proyecto propio de FASOR de protección ante incendios forestales.',
        } satisfies RouteMeta,
      },
      {
        path: 'unete',
        lazy: () => import('./pages/Unete').then((m) => ({ Component: m.default })),
        handle: {
          title: 'Únete - FASOR',
          description: 'Categorías de socios, derechos y deberes, y cómo alistarse en FASOR.',
        } satisfies RouteMeta,
      },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
];
