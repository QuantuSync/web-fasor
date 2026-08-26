import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Mail, MailOpen, ShieldAlert, Trash2 } from 'lucide-react';
import type { EntradaBuzon } from '../../lib/enlace-types';
import { formatoFechaHora } from '../../lib/enlace-buzon';

/*
 * Una entrada del buzón, en tarjeta. Nunca en tabla, igual que en la gestión de
 * miembros: a 360px una tabla se rompe y aquí hay que poder leer y actuar con
 * el pulgar.
 *
 * Sirve para las dos cosas que caben en la bandeja, un mensaje y un aviso de
 * cadena de mando, y las pinta claramente distintas. El aviso no se abre ni se
 * responde, y no lleva asunto porque no lo tiene: solo consta quién ha escrito
 * a quién y cuándo.
 *
 * Eliminar no se ejecuta al primer toque, abre su confirmación dentro de la
 * propia tarjeta, sin diálogo modal. El texto dice las dos cosas que hay que
 * saber antes de tocarlo, que es permanente y que solo afecta a la vista de
 * quien elimina.
 */

interface Props {
  entrada: EntradaBuzon;
  /** En enviados se nombra al destinatario; en la bandeja, al remitente */
  lado: 'recibido' | 'enviado';
  nombreDe: (id: string) => string;
  onAbrir?: () => void;
  onMarcarLeido?: () => void;
  onArchivar: () => void;
  onEliminar: () => void;
}

export default function TarjetaEntrada({
  entrada,
  lado,
  nombreDe,
  onAbrir,
  onMarcarLeido,
  onArchivar,
  onEliminar,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);

  if (entrada.tipo === 'aviso') {
    const { aviso } = entrada;
    const sinLeer = !aviso.leido_en;

    return (
      <article className="rounded-sm border border-fasor-gold/40 bg-fasor-surface2 p-4 sm:p-5">
        <p className="etiqueta mb-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          Aviso de mando
        </p>

        <p className="text-sm leading-relaxed text-fasor-bone">
          <span className="font-semibold">{nombreDe(aviso.remitente)}</span> ha escrito a{' '}
          <span className="font-semibold">{nombreDe(aviso.destinatario)}</span>, saltándose la
          cadena de mando.
        </p>

        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-fasor-sage">
          {formatoFechaHora(aviso.creado_en)}
          {sinLeer && <span className="ml-3 text-fasor-gold">Sin leer</span>}
        </p>

        {/* Esto es una decisión del sistema, no una limitación de la pantalla,
            así que se le dice al mando en vez de dejarle buscando el botón. */}
        <p className="mt-3 text-xs leading-relaxed text-fasor-sage">
          El aviso deja constancia de que ocurrió. No da acceso al mensaje ni a su asunto, y por eso
          no se puede abrir ni responder.
        </p>

        {confirmando ? (
          <Confirmacion
            pregunta="Vas a eliminar este aviso. Es permanente y no se puede deshacer. Los avisos solo los ves tú, así que desaparece del todo."
            onConfirmar={() => {
              setConfirmando(false);
              onEliminar();
            }}
            onCancelar={() => setConfirmando(false)}
          />
        ) : (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-fasor-line pt-4">
            {sinLeer && onMarcarLeido && (
              <Accion icono={Check} rotulo="Marcar leído" onClick={onMarcarLeido} />
            )}
            <Accion
              icono={aviso.archivado ? ArchiveRestore : Archive}
              rotulo={aviso.archivado ? 'Devolver' : 'Archivar'}
              onClick={onArchivar}
            />
            <Accion icono={Trash2} rotulo="Eliminar" onClick={() => setConfirmando(true)} />
          </div>
        )}
      </article>
    );
  }

  const { mensaje } = entrada;
  const esRecibido = lado === 'recibido';
  const sinLeer = esRecibido && !mensaje.leido_en;
  const archivado = esRecibido ? mensaje.archivado_destinatario : mensaje.archivado_remitente;
  const quien = esRecibido ? mensaje.remitente : mensaje.destinatario;

  return (
    <article
      className={`rounded-sm border bg-fasor-surface p-4 sm:p-5 ${
        sinLeer ? 'border-fasor-gold/40' : 'border-fasor-gold/25'
      }`}
    >
      <button
        type="button"
        onClick={onAbrir}
        className="block min-h-[44px] w-full text-left transition-colors duration-200 hover:opacity-90"
      >
        <span className="flex items-start gap-2 font-mono text-xs uppercase tracking-widest text-fasor-gold">
          {sinLeer ? (
            <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <MailOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="break-words">
            {esRecibido ? 'De' : 'Para'} {nombreDe(quien)}
          </span>
        </span>

        <span className="mt-2 block break-words font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
          {mensaje.asunto}
        </span>

        <span className="mt-2 block font-mono text-xs uppercase tracking-widest text-fasor-sage">
          {formatoFechaHora(mensaje.creado_en)}
          {/* La marca de no leído no se fía del color, lleva su rótulo */}
          {sinLeer && <span className="ml-3 text-fasor-gold">Sin leer</span>}
          {!esRecibido && mensaje.leido_en && <span className="ml-3">Leído</span>}
        </span>
      </button>

      {confirmando ? (
        <Confirmacion
          pregunta={
            esRecibido
              ? `Vas a eliminar este mensaje de tu bandeja. Es permanente y no se puede deshacer. Solo desaparece de tu vista, ${nombreDe(quien)} conserva su copia en Enviados.`
              : `Vas a eliminar este mensaje de tus enviados. Es permanente y no se puede deshacer. Solo desaparece de tu vista, ${nombreDe(quien)} conserva el que recibió.`
          }
          onConfirmar={() => {
            setConfirmando(false);
            onEliminar();
          }}
          onCancelar={() => setConfirmando(false)}
        />
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-fasor-line pt-4">
          <Accion
            icono={archivado ? ArchiveRestore : Archive}
            rotulo={archivado ? 'Devolver' : 'Archivar'}
            onClick={onArchivar}
          />
          <Accion icono={Trash2} rotulo="Eliminar" onClick={() => setConfirmando(true)} />
        </div>
      )}
    </article>
  );
}

// Mismo botón de acción que en la gestión de miembros, contorno fino y área
// táctil de 44px.
function Accion({
  icono: Icono,
  rotulo,
  onClick,
}: {
  icono: typeof Archive;
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-fasor-gold/40
                 px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em]
                 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2"
    >
      <Icono className="h-4 w-4" aria-hidden="true" />
      {rotulo}
    </button>
  );
}

// Confirmación explícita dentro de la tarjeta, como en la gestión de miembros
function Confirmacion({
  pregunta,
  onConfirmar,
  onCancelar,
}: {
  pregunta: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="mt-4 border-t border-fasor-line pt-4">
      <p className="text-sm leading-relaxed text-fasor-bone">{pregunta}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-solido w-full sm:w-auto" onClick={onConfirmar}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar
        </button>
        <button type="button" className="btn-contorno w-full sm:w-auto" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
