import { TrendingUp, ArrowUpRight, Github } from 'lucide-react';
import { config } from '../config';

/** Metodika a dokumentace API žijí v README na GitHubu, ne na stránce. */
const METHODOLOGY_URL = `${config.repository}#co-stránka-tvrdí-a-proč`;

export function Footer() {
  const links = [
    { href: config.links.web, label: 'Oficiální web' },
    { href: config.links.x, label: 'X / Twitter' },
    { href: config.links.instagram, label: 'Instagram' },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href));

  return (
    <footer className="footer">
      <div className="container footer-inner">
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
          <a href={METHODOLOGY_URL} target="_blank" rel="noopener noreferrer">
            Metodika a zdroje
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a href={config.repository} target="_blank" rel="noopener noreferrer">
            <Github size={13} aria-hidden="true" />
            Zdrojový kód
          </a>
        </nav>
      </div>
    </footer>
  );
}
