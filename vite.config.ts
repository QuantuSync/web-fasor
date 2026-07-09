import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    entry: 'src/main.tsx',
    // /historia -> dist/historia/index.html
    dirStyle: 'nested',
    // vite-react-ssg inyecta <link rel="preload" as="image" crossorigin> para las
    // imágenes de cada ruta, pero los <img> cargan sin crossorigin (mismo origen),
    // así que el navegador descarta el preload y avisa por consola. Quitamos el
    // crossorigin SOLO de los preload de imagen (no de fuentes/JS, que sí lo necesitan)
    // para que el preload coincida con la imagen y la consola quede limpia.
    onPageRendered: (_route: string, html: string) =>
      html.replace(/<link\b[^>]*\bas="image"[^>]*>/g, (tag) =>
        tag.replace(/\s+crossorigin(="[^"]*")?/g, '')
      ),
  },
});
