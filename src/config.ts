/**
 * Konfigurace provozovatele stránky.
 *
 * V návrhu je v patičce logo politické strany a tři odkazy. Doplň sem
 * skutečné hodnoty — dokud jsou `null`, patička odkaz nezobrazí, aby web
 * netvrdil nic, co není pravda.
 */

export interface SiteConfig {
  /** Jméno provozovatele v patičce. */
  organisation: string;
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
  organisation: 'Doplňte název provozovatele',
  logo: null,
  links: {
    web: null,
    x: null,
    instagram: null,
  },
  contact: null,
  repository: 'https://github.com',
};
