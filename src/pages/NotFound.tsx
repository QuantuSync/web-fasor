import { Link } from 'react-router-dom';
import Galon from '../components/Galon';

// 404 temática: la posición solicitada queda fuera del mapa operativo.
// window.history solo se toca en el handler (regla SSG).
export default function NotFound() {
  return (
    <div className="content-container flex min-h-[70vh] items-center py-16">
      <div className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-xs tracking-widest text-fasor-gold">ERROR</span>
          <Galon />
          <p className="etiqueta m-0">Zona no cartografiada</p>
        </div>
        <p
          className="m-0 font-display text-8xl font-bold leading-none tracking-tight text-fasor-gold/60 md:text-9xl"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-fasor-bone md:text-4xl">
          Página No Encontrada
        </h1>
        <div className="linea-fade mt-6" aria-hidden="true"></div>
        <p className="mt-6 max-w-md leading-relaxed text-fasor-sage">
          Esta posición queda fuera del mapa operativo de FASOR. Revisa la dirección o vuelve a la
          base para reorientarte.
        </p>
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link to="/" className="btn-contorno">
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.15em] text-fasor-gold"
          >
            Volver Atrás
            <Galon className="h-3 w-2 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
