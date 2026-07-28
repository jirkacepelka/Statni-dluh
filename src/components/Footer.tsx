import { Handshake, ArrowUpRight } from 'lucide-react';
import { config } from '../config';

export function Footer() {
  const links = [
    { href: config.links.web, label: 'Oficiální web strany' },
    { href: config.links.x, label: 'X/Twitter' },
    { href: config.links.instagram, label: 'Instagram' },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href));

  return (
    <footer className="footer">
      <div className="container">
        {/* Dodané logo obsahuje i nápis, takže se textová varianta nekreslí. */}
        <div className="brand">
          {config.logo ? (
            <img
              src={config.logo}
              alt={`${config.organisation}${config.tagline ? ` – ${config.tagline}` : ''}`}
              height={44}
            />
          ) : (
            <>
              <Handshake size={34} strokeWidth={2} aria-hidden="true" />
              {config.organisation}
              {config.tagline && <span className="brand-tag">{config.tagline}</span>}
            </>
          )}
        </div>

        <nav className="footer-links" aria-label="Odkazy">
          {links.map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              {label}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
