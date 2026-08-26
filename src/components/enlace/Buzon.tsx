import { useCallback, useEffect, useMemo, useState } from 'react';
import { Inbox, PenLine, Send, ShieldAlert } from 'lucide-react';
import Galon from '../Galon';
import type {
  AvisoCadena,
  EntradaBuzon,
  Mensaje,
  MiembroDirectorio,
  Perfil,
} from '../../lib/enlace-types';
import { mensajeDeError } from '../../lib/enlace-gestion';
import {
  archivarAviso,
  archivarMensaje,
  cargarDirectorio,
  enviarMensaje,
  listarAvisos,
  listarEnviados,
  listarRecibidos,
  marcarAvisoLeido,
  marcarMensajeLeido,
} from '../../lib/enlace-buzon';
import TarjetaEntrada from './TarjetaEntrada';
import LecturaMensaje from './LecturaMensaje';
import RedactarMensaje, { type Borrador } from './RedactarMensaje';

/*
 * Buzón interno, la vía oficial de comunicación de la entidad.
 *
 * Funciona como el correo y no como una mensajería instantánea: asunto y
 * cuerpo, bandeja de entrada, enviados y respuesta. Se escribe siempre a una
 * persona concreta; en esta fase no hay envío a grupos.
 *
 * La bandeja mezcla dos cosas de origen distinto, los mensajes recibidos y los
 * avisos de salto de cadena de mando. Son tablas separadas en la base de datos
 * y aquí se juntan solo para pintarlas en orden de fecha. Un aviso no se abre,
 * no se responde y no lleva nada del mensaje que lo originó, ni siquiera su
 * identificador. Es deliberado, el mando se entera de que ha ocurrido y no de
 * lo que se dijo, y no se debe ampliar.
 */

type Vista = 'bandeja' | 'enviados' | 'redactar';

export default function Buzon({ perfil }: { perfil: Perfil }) {
  const [vista, setVista] = useState<Vista>('bandeja');
  const [directorio, setDirectorio] = useState<MiembroDirectorio[]>([]);
  const [recibidos, setRecibidos] = useState<Mensaje[]>([]);
  const [enviados, setEnviados] = useState<Mensaje[]>([]);
  const [avisos, setAvisos] = useState<AvisoCadena[]>([]);
  const [abierto, setAbierto] = useState<Mensaje | null>(null);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [verArchivados, setVerArchivados] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [dir, entrada, salida, cadena] = await Promise.all([
        cargarDirectorio(),
        listarRecibidos(perfil.id),
        listarEnviados(perfil.id),
        listarAvisos(perfil.id),
      ]);
      setDirectorio(dir);
      setRecibidos(entrada);
      setEnviados(salida);
      setAvisos(cadena);
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cargar el buzón.'));
    } finally {
      setCargando(false);
    }
  }, [perfil.id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Nombre de cualquiera que aparezca en un mensaje o en un aviso. El
  // directorio incluye a los de baja justamente para esto, para poder nombrar a
  // quien ya no está en vez de dejar un hueco.
  const porId = useMemo(
    () => new Map(directorio.map((miembro) => [miembro.id, miembro])),
    [directorio]
  );
  const nombreDe = useCallback(
    (id: string) => porId.get(id)?.nombre ?? 'Miembro no identificado',
    [porId]
  );

  // A quién se puede escribir: miembros de alta, menos uno mismo.
  const destinatariosPosibles = useMemo(
    () => directorio.filter((miembro) => miembro.activo && miembro.id !== perfil.id),
    [directorio, perfil.id]
  );

  // Lo que se ve en la bandeja, en una sola lista ordenada por fecha.
  const entradas = useMemo<EntradaBuzon[]>(() => {
    const deMensajes: EntradaBuzon[] = recibidos
      .filter((m) => verArchivados === m.archivado_destinatario)
      .map((mensaje) => ({ tipo: 'mensaje', mensaje }));
    const deAvisos: EntradaBuzon[] = avisos
      .filter((a) => verArchivados === a.archivado)
      .map((aviso) => ({ tipo: 'aviso', aviso }));

    return [...deMensajes, ...deAvisos].sort((a, b) => {
      const fechaA = a.tipo === 'mensaje' ? a.mensaje.creado_en : a.aviso.creado_en;
      const fechaB = b.tipo === 'mensaje' ? b.mensaje.creado_en : b.aviso.creado_en;
      return fechaB.localeCompare(fechaA);
    });
  }, [recibidos, avisos, verArchivados]);

  const enviadosVisibles = useMemo(
    () => enviados.filter((m) => verArchivados === m.archivado_remitente),
    [enviados, verArchivados]
  );

  // Contador de no leídos, mensajes y avisos juntos. Los archivados no cuentan,
  // que para eso se apartan.
  const noLeidos =
    recibidos.filter((m) => !m.leido_en && !m.archivado_destinatario).length +
    avisos.filter((a) => !a.leido_en && !a.archivado).length;

  const reemplazarMensaje = (actualizado: Mensaje) => {
    const cambiar = (lista: Mensaje[]) =>
      lista.map((m) => (m.id === actualizado.id ? actualizado : m));
    setRecibidos(cambiar);
    setEnviados(cambiar);
    setAbierto((previo) => (previo && previo.id === actualizado.id ? actualizado : previo));
  };

  const abrirMensaje = async (mensaje: Mensaje) => {
    setError('');
    setAviso('');
    setAbierto(mensaje);

    // Marcar leído al abrir. Solo puede hacerlo el destinatario, así que en
    // enviados no se intenta siquiera.
    if (!mensaje.leido_en && mensaje.destinatario === perfil.id) {
      try {
        reemplazarMensaje(await marcarMensajeLeido(mensaje.id));
      } catch (e) {
        setError(mensajeDeError(e, 'No se ha podido marcar el mensaje como leído.'));
      }
    }
  };

  const handleArchivarMensaje = async (mensaje: Mensaje, archivado: boolean) => {
    setError('');
    setAviso('');
    const lado = mensaje.destinatario === perfil.id ? 'recibido' : 'enviado';
    try {
      reemplazarMensaje(await archivarMensaje(mensaje.id, lado, archivado));
      setAbierto(null);
      setAviso(archivado ? 'Mensaje archivado.' : 'Mensaje devuelto a la bandeja.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido archivar el mensaje.'));
    }
  };

  const reemplazarAviso = (actualizado: AvisoCadena) =>
    setAvisos((previos) => previos.map((a) => (a.id === actualizado.id ? actualizado : a)));

  const handleMarcarAviso = async (avisoCadena: AvisoCadena) => {
    setError('');
    setAviso('');
    try {
      reemplazarAviso(await marcarAvisoLeido(avisoCadena.id));
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido marcar el aviso.'));
    }
  };

  const handleArchivarAviso = async (avisoCadena: AvisoCadena, archivado: boolean) => {
    setError('');
    setAviso('');
    try {
      reemplazarAviso(await archivarAviso(avisoCadena.id, archivado));
      setAviso(archivado ? 'Aviso archivado.' : 'Aviso devuelto a la bandeja.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido archivar el aviso.'));
    }
  };

  const handleEnviar = async (datos: {
    destinatario: string;
    asunto: string;
    cuerpo: string;
    respondeA: string | null;
  }) => {
    setError('');
    setAviso('');
    setEnviando(true);
    try {
      const nuevo = await enviarMensaje({
        remitente: perfil.id,
        ...datos,
        respondeA: datos.respondeA,
      });
      setEnviados((previos) => [nuevo, ...previos]);
      setBorrador(null);
      setAbierto(null);
      setVista('enviados');
      setAviso(`Mensaje enviado a ${nombreDe(nuevo.destinatario)}.`);
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido enviar el mensaje.'));
    } finally {
      setEnviando(false);
    }
  };

  // Responder hereda el asunto tal cual, sin prefijo, y enlaza la conversación.
  const responder = (mensaje: Mensaje) => {
    const otro = mensaje.remitente === perfil.id ? mensaje.destinatario : mensaje.remitente;
    setBorrador({ destinatario: otro, asunto: mensaje.asunto, respondeA: mensaje.id });
    setAbierto(null);
    setVista('redactar');
  };

  const irA = (siguiente: Vista) => {
    setAbierto(null);
    setError('');
    setAviso('');
    if (siguiente !== 'redactar') setBorrador(null);
    setVista(siguiente);
  };

  return (
    <section className="mt-10 rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <p className="etiqueta mb-2">Comunicaciones</p>
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
        <Galon count={2} className="h-4 w-3 shrink-0" />
        Buzón
      </h2>
      <div className="linea-fade mt-4" aria-hidden="true"></div>

      {/* Un mensaje abierto ocupa el sitio de la lista, sin ventanas flotantes */}
      {abierto ? (
        <LecturaMensaje
          mensaje={abierto}
          perfil={perfil}
          nombreDe={nombreDe}
          onVolver={() => setAbierto(null)}
          onResponder={() => responder(abierto)}
          onArchivar={() =>
            void handleArchivarMensaje(
              abierto,
              !(abierto.destinatario === perfil.id
                ? abierto.archivado_destinatario
                : abierto.archivado_remitente)
            )
          }
        />
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pestana
              icono={Inbox}
              rotulo="Bandeja"
              activa={vista === 'bandeja'}
              cuenta={noLeidos}
              onClick={() => irA('bandeja')}
            />
            <Pestana
              icono={Send}
              rotulo="Enviados"
              activa={vista === 'enviados'}
              onClick={() => irA('enviados')}
            />
            <Pestana
              icono={PenLine}
              rotulo="Redactar"
              activa={vista === 'redactar'}
              onClick={() => irA('redactar')}
            />
          </div>

          <div aria-live="polite" className="mt-5 space-y-2">
            {error && (
              <p className="flex items-start gap-2 text-sm text-fasor-bone">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold"
                  aria-hidden="true"
                />
                {error}
              </p>
            )}
            {aviso && <p className="text-sm text-fasor-sage">{aviso}</p>}
          </div>

          {vista === 'redactar' ? (
            <RedactarMensaje
              perfil={perfil}
              miembros={destinatariosPosibles}
              borrador={borrador}
              enviando={enviando}
              onEnviar={(datos) => void handleEnviar(datos)}
              onCancelar={() => irA('bandeja')}
            />
          ) : (
            <>
              {cargando && (
                <p className="mt-6 font-mono text-xs tracking-widest text-fasor-gold" role="status">
                  CARGANDO BUZÓN
                </p>
              )}

              {!cargando && (
                <div className="mt-6 space-y-4">
                  {vista === 'bandeja' &&
                    entradas.map((entrada) =>
                      entrada.tipo === 'mensaje' ? (
                        <TarjetaEntrada
                          key={entrada.mensaje.id}
                          entrada={entrada}
                          lado="recibido"
                          nombreDe={nombreDe}
                          onAbrir={() => void abrirMensaje(entrada.mensaje)}
                          onArchivar={() =>
                            void handleArchivarMensaje(entrada.mensaje, !verArchivados)
                          }
                        />
                      ) : (
                        <TarjetaEntrada
                          key={entrada.aviso.id}
                          entrada={entrada}
                          lado="recibido"
                          nombreDe={nombreDe}
                          onMarcarLeido={() => void handleMarcarAviso(entrada.aviso)}
                          onArchivar={() => void handleArchivarAviso(entrada.aviso, !verArchivados)}
                        />
                      )
                    )}

                  {vista === 'enviados' &&
                    enviadosVisibles.map((mensaje) => (
                      <TarjetaEntrada
                        key={mensaje.id}
                        entrada={{ tipo: 'mensaje', mensaje }}
                        lado="enviado"
                        nombreDe={nombreDe}
                        onAbrir={() => void abrirMensaje(mensaje)}
                        onArchivar={() => void handleArchivarMensaje(mensaje, !verArchivados)}
                      />
                    ))}

                  {vista === 'bandeja' && entradas.length === 0 && (
                    <p className="text-sm text-fasor-sage">
                      {verArchivados
                        ? 'No tienes nada archivado.'
                        : 'No tienes ningún mensaje en la bandeja.'}
                    </p>
                  )}

                  {vista === 'enviados' && enviadosVisibles.length === 0 && (
                    <p className="text-sm text-fasor-sage">
                      {verArchivados
                        ? 'No tienes enviados archivados.'
                        : 'Todavía no has enviado ningún mensaje.'}
                    </p>
                  )}

                  <button
                    type="button"
                    className="min-h-[44px] font-mono text-xs uppercase tracking-widest text-fasor-gold underline underline-offset-4"
                    onClick={() => setVerArchivados((previo) => !previo)}
                  >
                    {verArchivados ? 'Ver la bandeja' : 'Ver archivados'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

// Pestaña de navegación del buzón. Botón normal con `aria-pressed`, no un
// tablist: no se implementa media ARIA de pestañas para luego no responder a
// las flechas del teclado.
function Pestana({
  icono: Icono,
  rotulo,
  activa,
  cuenta,
  onClick,
}: {
  icono: typeof Inbox;
  rotulo: string;
  activa: boolean;
  cuenta?: number;
  onClick: () => void;
}) {
  const sinLeer = cuenta && cuenta > 0 ? cuenta : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      aria-label={sinLeer > 0 ? `${rotulo}, ${sinLeer} sin leer` : undefined}
      className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-sm border
                  px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em]
                  transition-colors duration-200 sm:flex-none ${
                    activa
                      ? 'border-fasor-gold bg-fasor-surface2 text-fasor-bone'
                      : 'border-fasor-line text-fasor-sage hover:bg-fasor-surface2'
                  }`}
    >
      <Icono className="h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
      {rotulo}
      {sinLeer > 0 && (
        <span
          aria-hidden="true"
          className="rounded-sm bg-fasor-gold px-1.5 py-0.5 font-mono text-[10px] leading-none text-fasor-bg"
        >
          {sinLeer}
        </span>
      )}
    </button>
  );
}
