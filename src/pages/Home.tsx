import SectionHeading from '../components/SectionHeading';

// Página de Inicio — placeholder de la fase 1; el hero y el contenido real llegan en la fase 2.
export default function Home() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <div className="stack-centered space-y-4">
        <h1
          className="text-5xl font-bold tracking-wider text-alanizGold-600 md:text-6xl"
          style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
        >
          FASOR
        </h1>
        <p className="max-w-2xl text-lg italic text-parchment-300">
          «Donde la memoria arde, también nace la fuerza de proteger.»
        </p>
      </div>
      <SectionHeading
        eyebrow="Fuerza de Auxilio, Soporte y Rescate"
        title="Contenido en preparación"
        intro="La presentación, la misión principal y los valores de FASOR se incorporarán en la fase de contenido."
      />
    </div>
  );
}
