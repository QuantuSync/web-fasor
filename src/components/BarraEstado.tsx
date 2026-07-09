// Indicador de estado operativo: barra fina con líneas doradas de 1px y texto
// mono con tracking. Lleva el ÚNICO animate-ping permitido en el sitio (el
// punto verde); prefers-reduced-motion lo deja estático desde index.css.
export default function BarraEstado() {
  return (
    <div className="border-y border-fasor-gold/25 bg-fasor-surface/60">
      <div className="content-container flex items-center gap-3 py-2.5">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-estado-verde opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-estado-verde"></span>
        </span>
        <p className="m-0 font-mono text-xs tracking-[0.25em] text-fasor-bone">
          <span className="sr-only">Estado actual: </span>
          OPERATIVO — EN SERVICIO
        </p>
      </div>
    </div>
  );
}
