import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Error boundary para capturar errores de React
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error en FASOR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-fasor-bg px-4">
          <div className="max-w-md">
            <AlertTriangle className="mb-4 h-12 w-12 text-fasor-gold" aria-hidden="true" />
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
              Error inesperado
            </h1>
            <div className="linea-fade mt-4" aria-hidden="true"></div>
            <p className="mt-4 leading-relaxed text-fasor-sage">
              Ha ocurrido un error inesperado en el sitio de FASOR. Recarga la página para volver a
              la posición.
            </p>
            <button onClick={() => window.location.reload()} className="btn-contorno mt-6">
              Recargar la página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
