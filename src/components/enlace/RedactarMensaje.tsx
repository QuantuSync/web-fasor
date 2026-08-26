import { useState, type FormEvent } from 'react';
import { Info, Send, ShieldAlert, X } from 'lucide-react';
import { ETIQUETA_RANGO, type MiembroDirectorio, type Perfil } from '../../lib/enlace-types';
import { haySaltoDeCadena, rangoQueRecibeElAviso } from '../../lib/enlace-buzon';
import SelectorDestinatario from './SelectorDestinatario';

/*
 * Redacción de un mensaje. Se despliega en el sitio de la lista, sin ventana
 * flotante, igual que el resto de la zona interna.
 *
 * Cuando el destinatario elegido va a generar un aviso al mando, se dice antes
 * de enviar. NO es una advertencia, ni una petición de permiso, ni un intento
 * de disuadir: el mensaje sale igual y escribir a quien haga falta es legítimo.
 * Es honestidad con el remitente, porque el aviso se registra en el servidor lo
 * diga aquí la pantalla o no, y por eso el texto informa de qué se registra (el
 * hecho, no el contenido) en lugar de reprochar nada. El icono es de
 * información, no de alerta, y en eso también va el tono.
 */

/** Datos que hereda una respuesta. El asunto va tal cual, sin prefijo. */
export interface Borrador {
  destinatario: string;
  asunto: string;
  respondeA: string;
}

interface Props {
  perfil: Perfil;
  /** Ya recortados a miembros de alta y sin uno mismo */
  miembros: MiembroDirectorio[];
  borrador: Borrador | null;
  enviando: boolean;
  onEnviar: (datos: {
    destinatario: string;
    asunto: string;
    cuerpo: string;
    respondeA: string | null;
  }) => void;
  onCancelar: () => void;
}

export default function RedactarMensaje({
  perfil,
  miembros,
  borrador,
  enviando,
  onEnviar,
  onCancelar,
}: Props) {
  /*
   * La otra parte de la conversación puede haber causado baja entre el mensaje
   * y la respuesta, y entonces ya no está en la lista de destinatarios. En ese
   * caso esto deja de ser una respuesta: se conserva el asunto, se suelta el
   * enlace con la conversación y el destinatario vuelve a elegirse. Enlazar la
   * respuesta a un hilo ajeno al nuevo destinatario sería peor que perder el
   * hilo.
   */
  const inicial = borrador ? (miembros.find((m) => m.id === borrador.destinatario) ?? null) : null;
  const esRespuesta = !!borrador && !!inicial;

  const [destinatario, setDestinatario] = useState<MiembroDirectorio | null>(inicial);
  const [asunto, setAsunto] = useState(borrador?.asunto ?? '');
  const [cuerpo, setCuerpo] = useState('');
  const [faltaDestinatario, setFaltaDestinatario] = useState(false);
  const salto = destinatario ? haySaltoDeCadena(perfil.rango, destinatario.rango) : false;
  const rangoAvisado = rangoQueRecibeElAviso(perfil.rango);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    if (!destinatario) {
      setFaltaDestinatario(true);
      return;
    }

    onEnviar({
      destinatario: destinatario.id,
      asunto: asunto.trim(),
      cuerpo: cuerpo.trim(),
      respondeA: esRespuesta ? (borrador?.respondeA ?? null) : null,
    });
  };

  return (
    <form className="form-tactico mt-6 border-t border-fasor-line pt-6" onSubmit={handleSubmit}>
      <p className="etiqueta">{esRespuesta ? 'Responder' : 'Mensaje nuevo'}</p>

      <SelectorDestinatario
        miembros={miembros}
        seleccionado={destinatario}
        bloqueado={esRespuesta}
        disabled={enviando}
        onSeleccionar={(miembro) => {
          setDestinatario(miembro);
          setFaltaDestinatario(false);
        }}
      />

      {faltaDestinatario && (
        <p className="flex items-start gap-2 text-sm text-fasor-bone">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          Elige a quién se lo escribes.
        </p>
      )}

      {borrador && !esRespuesta && (
        <p className="flex items-start gap-2 text-sm leading-relaxed text-fasor-bone">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          Quien mantenía contigo esa conversación ya no está de alta, así que no se le puede
          responder. Se conserva el asunto y eliges tú a quién se lo escribes.
        </p>
      )}

      {salto && rangoAvisado && (
        <p className="flex items-start gap-2 text-sm leading-relaxed text-fasor-bone">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          <span>
            Tu {ETIQUETA_RANGO[rangoAvisado] ?? rangoAvisado} recibirá un aviso de que has escrito y
            a quién, sin el asunto ni el contenido. Es solo informativo.
          </span>
        </p>
      )}

      <div>
        <label htmlFor="asunto-mensaje">Asunto</label>
        <input
          id="asunto-mensaje"
          type="text"
          required
          maxLength={140}
          autoComplete="off"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          disabled={enviando}
          className="!text-base"
        />
        {esRespuesta && (
          <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
            Heredado de la conversación. Puedes cambiarlo.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cuerpo-mensaje">Mensaje</label>
        <textarea
          id="cuerpo-mensaje"
          required
          rows={8}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          disabled={enviando}
          className="!text-base"
        ></textarea>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {enviando ? 'Enviando' : 'Enviar'}
        </button>
        <button
          type="button"
          className="btn-contorno w-full sm:w-auto"
          onClick={onCancelar}
          disabled={enviando}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  );
}
