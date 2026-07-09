import { Mail } from 'lucide-react';

// Enlace mailto con el tratamiento único de correos del sitio: dorado con
// subrayado fino y offset generoso, hover a bone, icono de correo delante y
// cuerpo normal (no reducido). Debe leerse a primer golpe de vista como
// enlace pulsable.
export default function CorreoEnlace({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-2 text-base text-fasor-gold underline decoration-1 underline-offset-4 hover:text-fasor-bone"
    >
      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
      {email}
    </a>
  );
}
