import { useState, type FormEvent } from 'react';
import { CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useSesion } from '../../context/useSesion';

/*
 * Cambio de la propia contraseña, disponible para cualquier miembro con
 * sesión iniciada, incluido un aspirante. Se hace enteramente con
 * supabase-js desde el cliente, con la sesión ya abierta, sin clave de
 * servicio ni función Edge nueva: `updateUser` solo puede tocar la cuenta de
 * quien llama, así que no hace falta más infraestructura que la que ya trae
 * el SDK.
 *
 * Antes de tocar nada se verifica la contraseña actual reautenticando con
 * `signInWithPassword`. Sin eso, una sesión abierta y desatendida (un equipo
 * compartido, una pestaña olvidada) dejaría a cualquiera secuestrar la cuenta
 * cambiando la contraseña sin saber la anterior. Esa reautenticación dispara
 * `onAuthStateChange` con el mismo usuario, que `SesionProvider` ya trata sin
 * desmontar la pantalla (ver ahí el comentario sobre `TOKEN_REFRESHED`), así
 * que no interrumpe nada que hubiera en curso (un examen a medias, por
 * ejemplo).
 */

const ERROR_ACTUAL = 'La contraseña actual no es correcta.';
const ERROR_RED = 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';
const ERROR_COINCIDEN = 'Las contraseñas nuevas no coinciden.';
const ERROR_GENERICO = 'No se ha podido cambiar la contraseña.';

export default function CambiarContrasena() {
  const { sesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [hecho, setHecho] = useState(false);

  const abrir = () => {
    setAbierto(true);
    setError('');
    setHecho(false);
  };

  const cerrar = () => {
    setAbierto(false);
    setActual('');
    setNueva('');
    setRepetir('');
    setError('');
    setHecho(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    if (nueva !== repetir) {
      setError(ERROR_COINCIDEN);
      setHecho(false);
      return;
    }

    const correo = sesion?.user?.email;
    if (!correo) {
      setError(ERROR_GENERICO);
      return;
    }

    setEnviando(true);
    setError('');
    setHecho(false);

    try {
      // Reautentica con la contraseña actual antes de cambiar nada.
      const { error: falloActual } = await getSupabase().auth.signInWithPassword({
        email: correo,
        password: actual,
      });
      if (falloActual) {
        const esRed = !falloActual.status || falloActual.status >= 500;
        setError(esRed ? ERROR_RED : ERROR_ACTUAL);
        return;
      }

      const { error: falloCambio } = await getSupabase().auth.updateUser({ password: nueva });
      if (falloCambio) {
        setError(ERROR_GENERICO);
        return;
      }

      setActual('');
      setNueva('');
      setRepetir('');
      setHecho(true);
    } catch {
      setError(ERROR_RED);
    } finally {
      setEnviando(false);
    }
  };

  if (!abierto) {
    return (
      <button type="button" className="btn-contorno mt-4 w-full" onClick={abrir}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Cambiar contraseña
      </button>
    );
  }

  return (
    <form
      className="form-tactico mt-4 border-t border-fasor-line pt-4"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <p className="etiqueta">Cambiar contraseña</p>

      <div>
        <label htmlFor="contrasena-actual">Contraseña actual</label>
        <input
          id="contrasena-actual"
          type="password"
          required
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          disabled={enviando}
          className="!text-base"
        />
      </div>

      <div>
        <label htmlFor="contrasena-nueva">Contraseña nueva</label>
        <input
          id="contrasena-nueva"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          disabled={enviando}
          className="!text-base"
        />
      </div>

      <div>
        <label htmlFor="contrasena-repetir">Repetir contraseña nueva</label>
        <input
          id="contrasena-repetir"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
          disabled={enviando}
          className="!text-base"
        />
      </div>

      <div aria-live="polite" role="status" className="min-h-[1.25rem]">
        {error && (
          <p className="flex items-start gap-2 text-sm text-fasor-bone">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            {error}
          </p>
        )}
        {hecho && !error && (
          <p className="flex items-start gap-2 text-sm text-fasor-bone">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            Contraseña actualizada.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
          {enviando ? 'Cambiando' : 'Confirmar cambio'}
        </button>
        <button
          type="button"
          className="btn-contorno w-full sm:w-auto"
          onClick={cerrar}
          disabled={enviando}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
