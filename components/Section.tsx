import type { ReactNode } from 'react';

/**
 * En-tête de section réutilisable.
 * Il impose le même rythme typographique partout : micro-label en mono,
 * titre en display, chapô en texte courant. C'est ce qui tient l'ensemble du
 * site visuellement cohérent d'une page à l'autre.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
}) {
  return (
    <header className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="eyebrow flex items-center gap-3">
        {align === 'left' && (
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-aurora to-transparent" />
        )}
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 font-display text-display-md font-semibold uppercase">
        {title}
      </h2>
      {lead && <p className="mt-5 text-lg leading-relaxed text-titanium">{lead}</p>}
    </header>
  );
}

/** Conteneur de section, avec le rythme vertical du site. */
export function Section({
  children,
  className = '',
  id,
  labelledBy,
  tone = 'dark',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  /**
   * `dark` : fond principal. `deep` : fond plus profond, pour créer un
   * contraste entre sections. `light` : section claire, respiration dans le
   * parcours — le contraste du texte y est inversé.
   */
  tone?: 'dark' | 'deep' | 'light';
}) {
  const tones = {
    dark: 'bg-void',
    deep: 'bg-abyss',
    light: 'bg-chrome text-void',
  };

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative py-20 md:py-28 lg:py-36 ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}
