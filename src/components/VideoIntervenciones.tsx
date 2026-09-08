import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import posterIntervenciones from '../assets/fasor-intervenciones-poster.jpg';
import videoIntervenciones from '../assets/fasor-intervenciones.mp4';

// Vídeo vertical (9:16) de intervenciones, decorativo. Reproducción automática
// silenciada solo si el navegador no pide menos movimiento; con
// prefers-reduced-motion se queda en el póster con un botón de reproducir
// manual. El autoplay se dispara desde el ref (no como atributo JSX) para que
// nunca llegue a arrancar antes de comprobar la preferencia. Sin controles
// nativos, solo el botón de sonido propio.
export default function VideoIntervenciones() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [silenciado, setSilenciado] = useState(true);
  const [reproducirManual, setReproducirManual] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const prefiereMenosMovimiento =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (prefiereMenosMovimiento) {
      setReproducirManual(true);
      return;
    }

    video.play().catch(() => setReproducirManual(true));
  }, []);

  const alternarSonido = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSilenciado(video.muted);
  };

  const iniciarReproduccion = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
    setReproducirManual(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded border border-fasor-gold/25">
      <video
        ref={videoRef}
        className="block w-full"
        width={720}
        height={1282}
        poster={posterIntervenciones}
        preload="metadata"
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={videoIntervenciones} type="video/mp4" />
      </video>

      {reproducirManual && (
        <button
          type="button"
          onClick={iniciarReproduccion}
          aria-label="Reproducir vídeo de una intervención de FASOR"
          className="absolute inset-0 flex items-center justify-center bg-fasor-bg/30"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-fasor-gold bg-fasor-bg/80">
            <Play
              className="ml-0.5 h-6 w-6 text-fasor-gold"
              aria-hidden="true"
              fill="currentColor"
            />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={alternarSonido}
        aria-label={silenciado ? 'Activar el sonido del vídeo' : 'Silenciar el vídeo'}
        className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-sm border border-fasor-gold/40 bg-fasor-bg/80 text-fasor-gold transition-colors duration-200 hover:bg-fasor-gold/10"
      >
        {silenciado ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
