import { TrendingUp, ArrowUpRight, Github } from 'lucide-react';
import { config } from '../config';
import { dataset } from '../../shared/dataset';
import { czDate } from '../../shared/format';

export function Footer() {
  const links = [
    { href: config.links.web, label: 'Oficiální web' },
    { href: config.links.x, label: 'X / Twitter' },
    { href: config.links.instagram, label: 'Instagram' },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href));

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="brand">
            {config.logo ? (
              <img src={config.logo} alt={config.organisation} height={34} />
            ) : (
              <span className="brand-mark" aria-hidden="true">
                <TrendingUp size={20} strokeWidth={2.2} />
              </span>
            )}
            {config.organisation}
          </div>

          <nav className="footer-links" aria-label="Odkazy">
            {links.map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                {label}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            ))}
            <a href="#metodika">Metodika a zdroje</a>
            <a href="#api">API</a>
            <a href={config.repository} target="_blank" rel="noopener noreferrer">
              <Github size={13} aria-hidden="true" />
              Zdrojový kód
            </a>
          </nav>
        </div>

        <p className="footer-note">
          Data z Ministerstva financí ČR a Českého statistického úřadu, naposledy zkontrolována{' '}
          {czDate(dataset.checkedAt)}. Zobrazená výše dluhu je dopočet mezi dvěma publikovanými
          hodnotami, nikoli měření v reálném čase.
          {config.contact && (
            <>
              {' '}
              Našli jste chybu? <a href={`mailto:${config.contact}`}>{config.contact}</a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
