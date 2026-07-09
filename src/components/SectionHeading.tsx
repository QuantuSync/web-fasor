// Patrón único de cabecera de sección para todo el sitio:
// antetítulo en versalitas + título (Display) + filete dorado fino + intro opcional.
// En modo centrado, TODOS los elementos quedan sobre el mismo eje central (.stack-centered).

interface SectionHeadingProps {
  /** Antetítulo corto en versalitas (opcional) */
  eyebrow?: string;
  /** Título de la sección */
  title: string;
  /** Texto introductorio opcional bajo el título */
  intro?: string;
  /** Alineación del bloque */
  align?: 'center' | 'left';
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div className={`mb-12 md:mb-16 ${isCenter ? 'stack-centered' : 'text-left'} ${className}`}>
      {eyebrow && <p className="eyebrow mb-3 text-alanizGold-600/70">{eyebrow}</p>}

      <h2 className="font-display text-3xl font-bold text-alanizGold-600 md:text-4xl">{title}</h2>

      <div className="rule-gold mt-4" aria-hidden="true"></div>

      {intro && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-parchment-300">{intro}</p>
      )}
    </div>
  );
}
