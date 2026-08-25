// Emblemas de habilitación del cuerpo de instructores de FASOR Academy.
// Emparentados con los galones del escalafón (chevrón cerrado en triángulo),
// apuntan hacia arriba, van sin relleno y con trazo dorado de esquinas vivas.
// Los tres niveles comparten tamaño y peso de trazo para que se lean como una
// progresión. El dorado es tinta, así que no llevan sombras ni brillos.

export type NivelHabilitacion = 1 | 2 | 3;

const ETIQUETAS: Record<NivelHabilitacion, string> = {
  1: 'Emblema de Instructor en Prácticas, triángulo de contorno simple',
  2: 'Emblema de Instructor, triángulo de doble contorno',
  3: 'Emblema de Instructor Jefe, triángulo de doble contorno con estrella de cuatro puntas',
};

// Triángulo exterior. El interior es el mismo trazado escalado respecto del
// baricentro (20, 23), lo que mantiene sus tres lados paralelos al exterior.
const TRIANGULO_EXTERIOR = '20,3 37,33 3,33';
const TRIANGULO_INTERIOR = '20,10.6 30.5,29.2 9.5,29.2';

// Estrella de cuatro puntas rellena, centrada en el hueco del triángulo interior
const ESTRELLA_CUATRO = '20,17.5 21.3,21.7 25.5,23 21.3,24.3 20,28.5 18.7,24.3 14.5,23 18.7,21.7';

export default function InstructorInsignia({
  nivel,
  className = 'h-9 w-10',
}: {
  nivel: NivelHabilitacion;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 36"
      className={`${className} text-fasor-gold`}
      role="img"
      aria-label={ETIQUETAS[nivel]}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="miter"
      strokeLinecap="square"
    >
      <polygon points={TRIANGULO_EXTERIOR} />
      {nivel >= 2 && <polygon points={TRIANGULO_INTERIOR} />}
      {nivel === 3 && <polygon points={ESTRELLA_CUATRO} fill="currentColor" stroke="none" />}
    </svg>
  );
}
