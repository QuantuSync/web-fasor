import SectionHeading from '../components/SectionHeading';

// Página de Entidad — placeholder de la fase 1; el contenido real llega en las fases 2-3.
export default function Entidad() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <h1 className="stack-centered font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
        Entidad
      </h1>
      <SectionHeading
        eyebrow="FASOR"
        title="Contenido en preparación"
        intro="Los datos registrales, los fines estatutarios y el vínculo con la Casa Alaniz se incorporarán en las próximas fases."
      />
    </div>
  );
}
