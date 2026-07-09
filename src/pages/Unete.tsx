import SectionHeading from '../components/SectionHeading';

// Página de Únete — placeholder de la fase 1; el contenido real llega en las fases 2-3.
export default function Unete() {
  return (
    <div className="content-container py-16 md:py-24 space-y-8">
      <h1 className="stack-centered font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
        Únete
      </h1>
      <SectionHeading
        eyebrow="FASOR"
        title="Contenido en preparación"
        intro="Las categorías de socios, sus derechos y deberes, y la forma de alistarse se incorporarán en las próximas fases."
      />
    </div>
  );
}
