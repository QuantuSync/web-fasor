import SectionHeading from '../components/SectionHeading';

// Página de Organización — placeholder de la fase 1; el contenido real llega en la fase 2.
export default function Organizacion() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <h1 className="stack-centered font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
        Organización
      </h1>
      <SectionHeading
        eyebrow="FASOR"
        title="Contenido en preparación"
        intro="La estructura organizativa, el escalafón oficial y los órganos de gobierno se incorporarán en la fase de contenido."
      />
    </div>
  );
}
