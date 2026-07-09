import React from 'react';
import { Swords } from 'lucide-react';

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
    console.error('Error en Casa Alaniz:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-alanizGreen-950 px-4">
          <div className="stack-centered max-w-md space-y-5">
            <Swords className="h-16 w-16 text-alanizGold-600" aria-hidden="true" />
            <h1 className="font-display text-2xl font-bold text-alanizGold-600">
              Error en el Archivo
            </h1>
            <p className="text-parchment-200">
              Ha ocurrido un error inesperado en el archivo heráldico. Los custodios han sido
              notificados.
            </p>
            <button onClick={() => window.location.reload()} className="btn-alaniz">
              Restaurar Archivo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
