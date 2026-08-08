/**
 * Konfigurace provozovatele stránky — obsah patičky.
 *
 * Odkaz, který je `null`, se nezobrazí. Web radši neuvede nic než něco,
 * co si nedokáže ověřit.
 */

export interface SiteConfig {
  /**
   * Veřejná adresa webu bez koncového lomítka. Z ní se odvozuje canonical,
   * og:url, sitemap i robots.txt — proto je jen na tomhle jednom místě.
   */
  siteUrl: string;
  /** Jméno provozovatele v patičce. */
  organisation: string;
  /** Podtitul vedle jména, jako štítek. */
  tagline: string | null;
  /** Cesta k logu ve `public/`. Když je `null`, použije se textová značka. */
  logo: string | null;
  links: {
    web: string | null;
    x: string | null;
    instagram: string | null;
  };
  /** Kontakt pro opravy dat. */
  contact: string | null;
}

export const config: SiteConfig = {
  siteUrl: 'https://dluh.voluntia.cz',
  organisation: 'Voluntia',
  tagline: 'Libertariánská strana',
  logo: '/logo-voluntia.svg',
  links: {
    web: 'https://voluntia.cz/',
    x: 'https://x.com/voluntiacz',
    instagram: 'https://www.instagram.com/voluntiacz/',
  },
  contact: null,
};
