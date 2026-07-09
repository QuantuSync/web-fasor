import SectionHeading from '../components/SectionHeading';

// Página de Abeiro — placeholder de la fase 1; el contenido real llega en la fase 2.
export default function Abeiro() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <h1 className="stack-centered font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
        Abeiro
      </h1>
      <SectionHeading
        eyebrow="FASOR"
        title="Contenido en preparación"
        intro="El proyecto de protección ante incendios forestales, con su visor integrado, se incorporará en la fase de contenido."
      />
    </div>
  );
}
