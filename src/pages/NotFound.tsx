import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

// Página 404 temática: la posición solicitada queda fuera del mapa operativo.
// window.history solo se toca en el handler (regla SSG).
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="stack-centered space-y-5">
        <div className="inline-flex items-center justify-center w-24 h-24 border-2 border-alanizGold-600 bg-transparent rounded-full">
          <Compass className="h-12 w-12 text-alanizGold-600" aria-hidden="true" />
        </div>
        <p className="eyebrow text-alanizGold-600/70">Zona no cartografiada</p>
        <h1 className="font-display text-3xl font-bold text-alanizGold-600 md:text-4xl">
          Página No Encontrada
        </h1>
        <div className="rule-gold" aria-hidden="true"></div>
        <p className="max-w-md text-center text-parchment-300">
          Esta posición queda fuera del mapa operativo de FASOR. Revisa la dirección o vuelve a la
          base para reorientarte.
        </p>
        <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-alaniz">
            Volver al Inicio
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
}
