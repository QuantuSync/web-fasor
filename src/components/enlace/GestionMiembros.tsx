import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, UserPlus } from 'lucide-react';
import Galon from '../Galon';
import { type Perfil } from '../../lib/enlace-types';
import {
  crearMiembro,
  editarMiembro,
  eliminarMiembro,
  listarMiembros,
  mensajeDeError,
  restablecerContrasena,
  veTodaLaEntidad,
} from '../../lib/enlace-gestion';
import TarjetaMiembro from './TarjetaMiembro';
import FormularioMiembro, { type DatosMiembro } from './FormularioMiembro';

/*
 * Sección de gestión de miembros. Solo se monta para el comandante, el capitán
 * y los dos cargos de Junta Directiva, así que un teniente, un operador o un
 * cadete ni la ven ni piden la lista.
 *
 * La lista no lleva filtro de unidad: lo recorta la política de lectura de la
 * base de datos, de modo que el comandante y los cargos de Junta reciben a
 * todos y el capitán solo su unidad, sin que el navegador tenga que pedirlo ni
 * pueda evitarlo.
 */

export default function GestionMiembros({ gestor }: { gestor: Perfil }) {
  const [miembros, setMiembros] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dandoAlta, setDandoAlta] = useState(false);
  const [enviandoAlta, setEnviandoAlta] = useState(false);
  const [aviso, setAviso] = useState('');

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setMiembros(await listarMiembros());
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cargar la lista de miembros.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  // Sustituye en la lista el miembro que acaba de cambiar, sin recargar todo
  const reemplazar = (actualizado: Perfil) =>
    setMiembros((previos) => previos.map((m) => (m.id === actualizado.id ? actualizado : m)));

  const handleEditar = async (id: string, datos: DatosMiembro) => {
    setError('');
    setAviso('');
    try {
      reemplazar(
        await editarMiembro(id, { nombre: datos.nombre, rango: datos.rango, unidad: datos.unidad })
      );
      setAviso('Miembro actualizado.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido guardar el cambio.'));
      throw e;
    }
  };

  const handleEliminar = async (id: string) => {
    setError('');
    setAviso('');
    try {
      await eliminarMiembro(id);
      setMiembros((previos) => previos.filter((m) => m.id !== id));
      setAviso('Miembro eliminado.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido eliminar la cuenta.'));
      throw e;
    }
  };

  const handleRestablecer = async (id: string, contrasena: string) => {
    setError('');
    setAviso('');
    try {
      await restablecerContrasena(id, contrasena);
      setAviso('Contraseña cambiada. Comunícasela al miembro.');
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido cambiar la contraseña.'));
      throw e;
    }
  };

  const handleAlta = async (datos: DatosMiembro) => {
    setError('');
    setAviso('');
    setEnviandoAlta(true);
    try {
      const nuevo = await crearMiembro(datos);
      setMiembros((previos) =>
        [...previos, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      );
      setDandoAlta(false);
      setAviso(`${nuevo.nombre} ya puede entrar con el usuario ${datos.usuario}.`);
    } catch (e) {
      setError(mensajeDeError(e, 'No se ha podido dar de alta al miembro.'));
    } finally {
      setEnviandoAlta(false);
    }
  };

  return (
    <section className="mt-10 rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <p className="etiqueta mb-2">Gestión</p>
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
        <Galon count={2} className="h-4 w-3 shrink-0" />
        Miembros
      </h2>
      <div className="linea-fade mt-4" aria-hidden="true"></div>

      <p className="mt-4 text-sm leading-relaxed text-fasor-sage">
        {veTodaLaEntidad(gestor)
          ? 'Ves a todos los miembros de la entidad.'
          : 'Ves a los miembros de tu unidad.'}
      </p>

      {!dandoAlta && (
        <button type="button" className="btn-solido mt-5 w-full" onClick={() => setDandoAlta(true)}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Dar de alta
        </button>
      )}

      {dandoAlta && (
        <FormularioMiembro
          gestor={gestor}
          enviando={enviandoAlta}
          onGuardar={(datos) => void handleAlta(datos)}
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
            CARGANDO MIEMBROS
          </p>
        )}

        {!cargando && miembros.length === 0 && !error && (
          <p className="text-sm text-fasor-sage">Todavía no hay miembros que mostrar.</p>
        )}

        {miembros.map((miembro) => (
          <TarjetaMiembro
            key={miembro.id}
            miembro={miembro}
            gestor={gestor}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onRestablecer={handleRestablecer}
          />
        ))}
      </div>
    </section>
  );
}
