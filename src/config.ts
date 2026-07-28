/**
 * Konfigurace provozovatele stránky — obsah patičky.
 *
 * Odkaz, který je `null`, se nezobrazí. Web radši neuvede nic než něco,
 * co si nedokáže ověřit.
 */

export interface SiteConfig {
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
  /** Odkaz na zdrojový kód — dokládá, že se čísla nikde neohýbají. */
  repository: string;
}

export const config: SiteConfig = {
  organisation: 'Voluntia',
  tagline: 'Libertariánská strana',
  // Do public/ patří skutečné logo (podání ruky) a sem jeho cesta.
  logo: null,
  links: {
    web: 'https://voluntia.cz/',
    x: 'https://x.com/voluntiacz',
    // Instagramový profil se mi nepodařilo ověřit — doplňte skutečnou adresu.
    instagram: null,
  },
  contact: null,
  repository: 'https://github.com/jirkacepelka/Statni-dluh',
};
