import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

// Tarjeta unificada para todo el sitio (sobre la utilidad .card-elegant).
// - Si se pasa `to`, la tarjeta es un enlace de navegación interna.
// - `icon` muestra un badge de contorno dorado; `cta` añade un enlace de acción con flecha.

interface CardProps {
  icon?: LucideIcon;
  title?: string;
  /** Ruta interna; si se indica, toda la tarjeta es clicable */
  to?: string;
  /** Texto del enlace de acción (con flecha) */
  cta?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ icon, title, to, cta, className = '', children }: CardProps) {
  const content = (
    <>
      {icon && (
        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border-2
                     border-alanizGold-600 bg-transparent transition-transform duration-300
                     group-hover:scale-110"
        >
          {React.createElement(icon, {
            className: 'w-6 h-6 text-alanizGold-600',
            'aria-hidden': 'true',
          })}
        </div>
      )}

      {title && (
        <h3
          className="mb-3 font-display text-xl font-semibold text-alanizGold-600
                     transition-colors duration-300 group-hover:text-alanizGold-500"
        >
          {title}
        </h3>
      )}

      {children && <div className="text-sm leading-relaxed text-parchment-300">{children}</div>}

      {cta && (
        <div
          className="mt-4 flex items-center text-sm font-medium text-alanizGold-600
                     transition-colors duration-300 group-hover:text-alanizGold-500"
        >
          <span>{cta}</span>
          <ArrowRight
            className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );

  const base = 'group card-elegant block transition-all duration-500';

  if (to) {
    return (
      <Link to={to} className={`${base} hover:scale-[1.03] ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`${base} ${className}`}>{content}</div>;
}
