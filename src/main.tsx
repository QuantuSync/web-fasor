import './index.css';
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';

// Entry de vite-react-ssg: genera HTML estático por ruta en build e hidrata en cliente.
export const createRoot = ViteReactSSG({ routes });

// El siguiente código solo debe ejecutarse en el navegador, nunca durante el pre-render.
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  // Preload de rutas críticas para mejorar la navegación posterior
  import('./pages/Home');
  import('./pages/Unidades');
}
