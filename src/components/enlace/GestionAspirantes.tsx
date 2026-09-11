import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, UserPlus } from 'lucide-react';
import Galon from '../Galon';
import { type Perfil } from '../../lib/enlace-types';
import {
  cambiarAlta,
  crearMiembro,
  editarMiembro,
  listarAspirantes,
  mensajeDeError,
  restablecerContrasena,
} from '../../lib/enlace-gestion';
import {
  autorizarNuevoExamen,
  listarExamenesYaAutorizados,
  listarResumenExamenes,
  mensajeDeErrorExamen,
  type ResumenExamenAspirante,
} from '../../lib/enlace-examen';
import TarjetaAspirante from './TarjetaAspirante';
import FormularioAspirante, { type DatosAltaAspirante } from './FormularioAspirante';

/*
 * Apartado de gestión de aspirantes. Solo se monta para comandante, secretario
 * y tesorero (`puedeGestionarAspirantes`), separado a propósito de la Gestión
 * de Miembros de siempre, que ya excluye a los aspirantes de su listado.
 *
 * Existe para que un aspirante no quede huérfano si olvida su contraseña o si
 * hay que darlo de baja o corregirle el nombre, sin mezclarlo con el resto del
 * escalafón. La revisión de sus exámenes es una sección distinta, ver
 * `ExamenesPendientes`.
 */

export default function GestionAspirantes({ gestor }: { gestor: Perfil }) {
  const [aspirantes, setAspirantes] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dandoAlta, setDandoAlta] = useState(false);
  const [enviandoAlta, setEnviandoAlta] = useState(false);
  const [aviso, setAviso] = useState('');

  // Cuántos exámenes lleva cada aspirante y si su último ya tiene una
  // autorización pendiente de usarse. Solo el comandante puede leerlo (RLS de
  // `examenes` y de `examen_autorizaciones`), y es el único que puede
  // autorizar, así que a nadie más le hace falta pedirlo.
  const esComandante = gestor.rango === 'comandante';
  const [resumenes, setResumenes] = useState<Record<string, ResumenExamenAspirante>>({});
  const [yaAutorizados, setYaAutorizados] = useState<Set<string>>(new Set());

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const lista = await listarAspirantes();
      setAspirantes(lista);

      if (esComandante && lista.length > 0) {
        const ids = lista.map((a) => a.id);
        const resumen = await listarResumenExamenes(ids);
        setResumenes(resumen);

        const examenIds = Object.values(resumen)
          .map((r) => r.ultimoExamenId)
          .filter((id): id is string => id !== null);
        setYaAutorizados(await listarExamenesYaAutorizados(examenIds));
      }
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cargar la lista de aspirantes.'));
    } finally {
      setCargando(false);
    }
  }, [esComandante]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const reemplazar = (actualizado: Perfil) =>
    setAspirantes((previos) => previos.map((a) => (a.id === actualizado.id ? actualizado : a)));

  const handleRenombrar = async (id: string, nombre: string) => {
    setError('');
    setAviso('');
    try {
      reemplazar(await editarMiembro(id, { nombre, rango: 'aspirante', unidad: null }));
      setAviso('Aspirante renombrado.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido guardar el cambio.'));
      throw e;
    }
  };

  const handleCambiarAlta = async (id: string, activo: boolean) => {
    setError('');
    setAviso('');
    try {
      const actualizado = await cambiarAlta(id, activo);
      reemplazar(actualizado);
      setAviso(activo ? 'Aspirante reactivado.' : 'Aspirante dado de baja.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cambiar el alta.'));
      throw e;
    }
  };

  const handleRestablecer = async (id: string, contrasena: string) => {
    setError('');
    setAviso('');
    try {
      await restablecerContrasena(id, contrasena);
      setAviso('Contraseña cambiada. Comunícasela al aspirante.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cambiar la contraseña.'));
      throw e;
    }
  };

  const handleAutorizar = async (id: string, motivo: string) => {
    setError('');
    setAviso('');
    try {
      const autorizacion = await autorizarNuevoExamen(id, motivo);
      setYaAutorizados((previos) => new Set(previos).add(autorizacion.examen_id));
      setAviso('Nuevo examen autorizado.');
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido autorizar el nuevo examen.'));
      throw e;
    }
  };

  const handleAlta = async (datos: DatosAltaAspirante) => {
    setError('');
    setAviso('');
    setEnviandoAlta(true);
    try {
      const nuevo = await crearMiembro({ ...datos, rango: 'aspirante', unidad: null });
      setAspirantes((previos) =>
        [...previos, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      );
      setDandoAlta(false);
      setAviso(`${nuevo.nombre} ya puede entrar con el usuario ${datos.usuario}.`);
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido dar de alta al aspirante.'));
    } finally {
      setEnviandoAlta(false);
    }
  };

  return (
    <section className="mt-10 rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <p className="etiqueta mb-2">Gestión</p>
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
        <Galon count={2} className="h-4 w-3 shrink-0" />
        Aspirantes
      </h2>
      <div className="linea-fade mt-4" aria-hidden="true"></div>

      <p className="mt-4 text-sm leading-relaxed text-fasor-sage">
        Cuentas del proceso de ingreso, todavía sin rango. Al ser declarados aptos pasan
        automáticamente a Cadete en Formación, ver la revisión de exámenes.
      </p>

      {!dandoAlta && (
        <button type="button" className="btn-solido mt-5 w-full" onClick={() => setDandoAlta(true)}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Dar de alta
        </button>
      )}

      {dandoAlta && (
        <FormularioAspirante
          enviando={enviandoAlta}
          onGuardarAlta={(datos) => void handleAlta(datos)}
          onCancelar={() => setDandoAlta(false)}
        />
      )}

      <div aria-live="polite" className="mt-5 space-y-2">
        {error && (
          <p className="flex items-start gap-2 text-sm text-fasor-bone">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            {error}
          </p>
        )}
        {aviso && <p className="text-sm text-fasor-sage">{aviso}</p>}
      </div>

      <div className="mt-6 space-y-4">
        {cargando && (
          <p className="font-mono text-xs tracking-widest text-fasor-gold" role="status">
            CARGANDO ASPIRANTES
          </p>
        )}

        {!cargando && aspirantes.length === 0 && !error && (
          <p className="text-sm text-fasor-sage">Todavía no hay aspirantes que mostrar.</p>
        )}

        {aspirantes.map((aspirante) => {
          const resumenExamen = resumenes[aspirante.id];
          return (
            <TarjetaAspirante
              key={aspirante.id}
              aspirante={aspirante}
              gestor={gestor}
              onRenombrar={handleRenombrar}
              onCambiarAlta={handleCambiarAlta}
              onRestablecer={handleRestablecer}
              resumenExamen={esComandante ? resumenExamen : undefined}
              yaAutorizado={
                !!resumenExamen && yaAutorizados.has(resumenExamen.ultimoExamenId ?? '')
              }
              onAutorizar={esComandante ? handleAutorizar : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
