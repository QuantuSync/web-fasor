import { useEffect, useRef, useState } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, Reply } from 'lucide-react';
import Galon from '../Galon';
import type { Mensaje, Perfil } from '../../lib/enlace-types';
import { formatoFechaHora, listarHilo } from '../../lib/enlace-buzon';

/*
 * Un mensaje abierto. Ocupa el sitio de la lista dentro del panel, así que en
 * móvil se lee a pantalla completa sin necesidad de una ventana flotante, que
 * es lo que se evita en toda la zona interna.
 *
 * Debajo del cuerpo se listan los mensajes anteriores de la conversación. Solo
 * llegan los del hilo en los que uno participa, porque el recorte lo hace la
 * política de lectura de la base de datos y no este componente.
 */

interface Props {
  mensaje: Mensaje;
  perfil: Perfil;
  nombreDe: (id: string) => string;
  onVolver: () => void;
  onResponder: () => void;
  onArchivar: () => void;
}

export default function LecturaMensaje({
  mensaje,
  perfil,
  nombreDe,
  onVolver,
  onResponder,
  onArchivar,
}: Props) {
  const [hilo, setHilo] = useState<Mensaje[]>([]);
  const titular = useRef<HTMLHeadingElement>(null);

  // El foco va al asunto al abrir, para que un lector de pantalla anuncie el
  // mensaje y no se quede en el botón de la lista que ya no está.
  useEffect(() => {
    titular.current?.focus();
  }, [mensaje.id]);

  useEffect(() => {
    let vigente = true;

    // Un mensaje siempre nace con hilo, se lo pone el servidor. Si llegara sin
    // él (una fila vieja de antes del buzón), no se pregunta por la
    // conversación en vez de mandar una consulta sin sentido.
    if (!mensaje.hilo) {
      setHilo([]);
      return;
    }

    listarHilo(mensaje.hilo)
      .then((mensajes) => {
        if (vigente) setHilo(mensajes);
      })
      .catch(() => {
        // La conversación es un extra. Si no se puede cargar, el mensaje
        // abierto se lee igual y no se molesta con un error por esto.
        if (vigente) setHilo([]);
      });

    return () => {
      vigente = false;
    };
  }, [mensaje.hilo]);

  const esRecibido = mensaje.destinatario === perfil.id;
  const archivado = esRecibido ? mensaje.archivado_destinatario : mensaje.archivado_remitente;
  const otro = esRecibido ? mensaje.remitente : mensaje.destinatario;
  const anteriores = hilo.filter((m) => m.id !== mensaje.id);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex min-h-[44px] items-center gap-2 font-mono text-xs uppercase tracking-widest text-fasor-gold"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver
      </button>

      <p className="etiqueta mt-4 mb-2">{esRecibido ? 'Mensaje recibido' : 'Mensaje enviado'}</p>

      <h3
        ref={titular}
        tabIndex={-1}
        className="flex items-start gap-3 break-words font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone outline-none"
      >
        <Galon count={2} className="mt-1 h-4 w-3 shrink-0" />
        {mensaje.asunto}
      </h3>

      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-fasor-sage">
        {esRecibido ? 'De' : 'Para'} <span className="text-fasor-gold">{nombreDe(otro)}</span>
        <span className="ml-3">{formatoFechaHora(mensaje.creado_en)}</span>
      </p>

      <div className="linea-fade mt-4" aria-hidden="true"></div>

      <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-fasor-bone sm:text-base">
        {mensaje.cuerpo}
      </p>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-solido w-full sm:w-auto" onClick={onResponder}>
          <Reply className="h-4 w-4" aria-hidden="true" />
          Responder
        </button>
        <button type="button" className="btn-contorno w-full sm:w-auto" onClick={onArchivar}>
          {archivado ? (
            <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Archive className="h-4 w-4" aria-hidden="true" />
          )}
          {archivado ? 'Devolver a la bandeja' : 'Archivar'}
        </button>
      </div>

      {anteriores.length > 0 && (
        <div className="mt-10 border-t border-fasor-line pt-6">
          <p className="etiqueta mb-4">Antes en esta conversación</p>
          <div className="space-y-4">
            {anteriores.map((anterior) => (
              <article key={anterior.id} className="rounded-sm border border-fasor-gold/25 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-fasor-sage">
                  <span className="text-fasor-gold">{nombreDe(anterior.remitente)}</span>
                  <span className="ml-3">{formatoFechaHora(anterior.creado_en)}</span>
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-fasor-bone">
                  {anterior.cuerpo}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
