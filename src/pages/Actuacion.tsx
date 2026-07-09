import SectionHeading from '../components/SectionHeading';

// Página de Actuación — placeholder de la fase 1; el contenido real llega en la fase 2.
export default function Actuacion() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <h1 className="stack-centered font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
        Actuación
      </h1>
      <SectionHeading
        eyebrow="FASOR"
        title="Contenido en preparación"
        intro="Las especialidades, el entrenamiento, el protocolo de activación y los principios operativos se incorporarán en la fase de contenido."
      />
    </div>
  );
}
