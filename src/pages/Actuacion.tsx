import { useEffect } from 'react';
import { especialidades } from '../data/especialidades';
import { pilaresEntrenamiento, programaEntrenamiento } from '../data/entrenamiento';
import { protocoloActivacion } from '../data/protocolo';
import { principiosOperativos } from '../data/principios';

// Página de Actuación: especialidades, entrenamiento y preparación, protocolo de
// activación (Verde/Ámbar/Rojo) y principios operativos.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
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
    <div className="min-h-screen py-16 md:py-24">
      <div className="content-container">
        <div className="observe-me opacity-0 translate-y-8">
          <h1 className="stack-centered mb-12 font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
            Actuación
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6">
              Especialidades
            </h2>
            <p className="text-parchment-200 leading-relaxed mb-6">
              Cada miembro puede formarse en una o varias áreas de especialización, lo que permite
              desplegar equipos versátiles y autosuficientes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {especialidades.slice(0, 3).map((especialidad) => (
                  <div
                    key={especialidad.titulo}
                    className="bg-alanizGreen-900/50 rounded-lg p-4 border border-alanizGold-600/30"
                  >
                    <h3 className="font-display font-semibold text-alanizGold-500 mb-2 flex items-center">
                      <especialidad.icono
                        className="w-5 h-5 mr-2 text-alanizGold-600"
                        aria-hidden="true"
                      />
                      {especialidad.titulo}
                    </h3>
                    <p className="text-sm text-parchment-300">{especialidad.descripcion}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {especialidades.slice(3).map((especialidad) => (
                  <div
                    key={especialidad.titulo}
                    className="bg-alanizGreen-900/50 rounded-lg p-4 border border-alanizGold-600/30"
                  >
                    <h3 className="font-display font-semibold text-alanizGold-500 mb-2 flex items-center">
                      <especialidad.icono
                        className="w-5 h-5 mr-2 text-alanizGold-600"
                        aria-hidden="true"
                      />
                      {especialidad.titulo}
                    </h3>
                    <p className="text-sm text-parchment-300">{especialidad.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6">
              Entrenamiento y Preparación
            </h2>
            <p className="text-parchment-200 leading-relaxed mb-6">
              La preparación de los miembros se centra en la constancia y la excelencia. El
              entrenamiento combina resistencia física, fortaleza moral y pericia técnica.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pilaresEntrenamiento.map((pilar) => (
                <div
                  key={pilar.titulo}
                  className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30"
                >
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-alanizGold-600 bg-transparent rounded-full mb-3 mx-auto">
                      <pilar.icono className="w-5 h-5 text-alanizGold-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-display font-semibold text-alanizGold-500">
                      {pilar.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-parchment-300 text-center">{pilar.descripcion}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-display font-semibold text-alanizGold-500">
                Programa de Entrenamiento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programaEntrenamiento.map((item) => (
                  <div key={item.titulo} className="flex items-start space-x-3">
                    <item.icono
                      className="w-5 h-5 text-alanizGold-400 mt-1 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <h4 className="font-semibold text-alanizGold-500 text-sm">{item.titulo}</h4>
                      <p className="text-xs text-parchment-300">{item.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="card-elegant border-2 border-alanizGold-600/40 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '600ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6 text-center">
              Protocolo de Activación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {protocoloActivacion.map((nivel) => (
                <div key={nivel.nombre} className="stack-centered">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4 ${
                      nivel.critico ? 'animate-pulse' : ''
                    }`}
                  >
                    <span className="text-alanizGold-600 text-xl font-bold">{nivel.numero}</span>
                  </div>
                  <h3 className={`font-display font-semibold ${nivel.colorTitulo} mb-3`}>
                    {nivel.nombre}
                  </h3>
                  <div className="text-center">
                    <p className="text-sm text-parchment-300 font-semibold mb-1">
                      {nivel.categoria}
                    </p>
                    <p className="text-sm text-parchment-300 mb-1">{nivel.despliegue}</p>
                    <p className="text-sm text-parchment-300">{nivel.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '800ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6">
              Principios Operativos
            </h2>

            <div className="space-y-6">
              {principiosOperativos.map((principio) => (
                <div
                  key={principio.titulo}
                  className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30"
                >
                  <h3 className="font-display font-semibold text-alanizGold-500 mb-3 flex items-center">
                    <principio.icono
                      className="w-6 h-6 mr-3 text-alanizGold-600"
                      aria-hidden="true"
                    />
                    {principio.titulo}
                  </h3>
                  <p className="text-parchment-200 text-sm leading-relaxed">
                    {principio.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
