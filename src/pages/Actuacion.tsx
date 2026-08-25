import { useEffect } from 'react';
import TituloSeccion from '../components/TituloSeccion';
import { especialidades } from '../data/especialidades';
import { pilaresEntrenamiento, programaEntrenamiento } from '../data/entrenamiento';
import { protocoloActivacion } from '../data/protocolo';
import { principiosOperativos } from '../data/principios';

// Colores semánticos del protocolo (única excepción cromática del sistema).
// Se mapean aquí por nivel — el campo colorTitulo de src/data/protocolo.ts se
// conserva intacto (los datos no se tocan) pero ya no se usa.
// El bloque va sobre fondo base: el rojo #D65A4A da 4.73:1 ahí (AA), y además
// el nombre del nivel se compone en cuerpo gigante (umbral 3:1).
const COLOR_NIVEL: Record<number, string> = {
  1: 'text-estado-verde',
  2: 'text-estado-ambar',
  3: 'text-estado-rojo',
};

// Actuación: especialidades en dos columnas compactas, entrenamiento en tres
// pilares + programa, protocolo con el nivel como protagonista tipográfico y
// principios operativos en listado editorial.
// Contenido textual verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Actuacion() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elementsToObserve = document.querySelectorAll('.observe-me');
    elementsToObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">FASOR</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Actuación
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Especialidades */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion
            numero="01"
            titulo="Especialidades"
            intro="Cada miembro puede formarse en una o varias áreas de especialización, lo que permite desplegar equipos versátiles y autosuficientes."
          />
        </div>

        <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {especialidades.map((especialidad) => (
            <div key={especialidad.titulo} className="border-t border-fasor-line py-5">
              <div className="mb-2 flex items-center gap-3">
                <especialidad.icono
                  className="h-5 w-5 shrink-0 text-fasor-gold"
                  aria-hidden="true"
                />
                <h3 className="m-0 font-display text-base font-bold uppercase tracking-tight text-fasor-bone">
                  {especialidad.titulo}
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">
                {especialidad.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Entrenamiento y preparación */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="02"
              titulo="Entrenamiento y Preparación"
              intro="La preparación de los miembros se centra en la constancia y la excelencia. El entrenamiento combina resistencia física, fortaleza moral y pericia técnica."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {pilaresEntrenamiento.map((pilar) => (
              <div key={pilar.titulo} className="border-t-2 border-fasor-gold pt-5">
                <pilar.icono className="mb-3 h-6 w-6 text-fasor-gold" aria-hidden="true" />
                <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  {pilar.titulo}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-fasor-sage">{pilar.descripcion}</p>
              </div>
            ))}
          </div>

          <div className="observe-me opacity-0 translate-y-8 mt-14">
            <h3 className="mb-6 font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
              Programa de Entrenamiento
            </h3>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
              {programaEntrenamiento.map((item) => (
                <div key={item.titulo} className="flex items-start gap-3">
                  <item.icono
                    className="mt-0.5 h-5 w-5 shrink-0 text-fasor-gold"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="m-0 mb-1 text-sm font-semibold text-fasor-bone">
                      {item.titulo}
                    </h4>
                    <p className="m-0 text-xs leading-relaxed text-fasor-sage">
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Protocolo de activación: el nivel como protagonista tipográfico.
          Sobre fondo base (no superficie) por contraste AA del rojo. */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="03" titulo="Protocolo de Activación" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-12 md:grid-cols-3">
            {protocoloActivacion.map((nivel) => {
              const [palabraNivel, nombreNivel] = nivel.nombre.split(' ');
              return (
                <div key={nivel.nombre} className="border-t border-fasor-line pt-6">
                  <p className="m-0 mb-4 font-mono text-xs tracking-widest text-fasor-sage">
                    {String(nivel.numero).padStart(2, '0')}
                  </p>
                  <h3 className={`m-0 ${COLOR_NIVEL[nivel.numero]}`}>
                    <span className="block font-display text-sm font-semibold uppercase tracking-[0.25em]">
                      {palabraNivel}
                    </span>
                    <span className="block font-display text-6xl font-bold uppercase leading-none tracking-tight md:text-7xl">
                      {nombreNivel}
                    </span>
                  </h3>
                  <div className="mt-5 space-y-1">
                    <p className="m-0 text-sm font-semibold text-fasor-bone">{nivel.categoria}</p>
                    <p className="m-0 text-sm text-fasor-sage">{nivel.despliegue}</p>
                    <p className="m-0 font-mono text-xs tracking-wider text-fasor-sage">
                      {nivel.tiempo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principios operativos */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="04" titulo="Principios Operativos" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 space-y-10">
            {principiosOperativos.map((principio) => (
              <div key={principio.titulo} className="border-l-2 border-fasor-gold pl-6">
                <div className="mb-2 flex items-center gap-3">
                  <principio.icono className="h-5 w-5 text-fasor-gold" aria-hidden="true" />
                  <h3 className="m-0 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                    {principio.titulo}
                  </h3>
                </div>
                <p className="m-0 max-w-3xl text-sm leading-relaxed text-fasor-sage">
                  {principio.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
