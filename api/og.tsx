/**
 * Náhledový obrázek pro sdílení, generovaný při požadavku.
 *
 * Volají ho jen crawleři sociálních sítí, když někdo poprvé sdílí odkaz —
 * návštěvníci `og:image` nestahují. S hodinovou edge cache se funkce spustí
 * nejvýš jednou za hodinu bez ohledu na počet sdílení.
 *
 * Číslo se počítá stejným modelem jako web a `/api/dluh`, takže se nemohou
 * rozejít.
 */

import { ImageResponse } from '@vercel/og';
import { debtAt, growthPerDay } from '../shared/model';
import { czk, czkRounded, czDate } from '../shared/format';
import { dataset } from '../shared/dataset';
import { inter600, inter800 } from './_fonts';

export const config = { runtime: 'edge' };

const BG = '#111111';
const YELLOW = '#ffd400';
const MUTED = '#b4b4b4';

export default function handler() {
  const debt = debtAt();

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          padding: '70px',
          background: BG,
          color: '#ffffff',
          fontFamily: 'Inter',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Státní dluh České republiky
          </div>

          {/* Satori účaří mezi různými velikostmi nedrží, proto se „kč“
              zarovnává ke spodní hraně a dorovnává odsazením. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              fontSize: 98,
              fontWeight: 800,
              letterSpacing: '-0.04em',
            }}
          >
            {czk(debt.value)}
            <span style={{ fontSize: 32, color: YELLOW, marginLeft: 12, paddingBottom: 14 }}>
              kč
            </span>
          </div>

          <div style={{ display: 'flex', marginTop: 24, fontSize: 27, fontWeight: 600, color: MUTED }}>
            Odhad k {czDate(new Date().toISOString().slice(0, 10))} · roste o&nbsp;
            <span style={{ color: YELLOW, fontWeight: 800 }}>{czkRounded(growthPerDay)}</span>
            &nbsp;každý den
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            fontSize: 27,
          }}
        >
          <span style={{ color: MUTED, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Poslední publikovaný stav {czkRounded(dataset.debtAnchor.value)} k{' '}
            {czDate(dataset.debtAnchor.asOf)}
          </span>
          <span style={{ color: YELLOW, fontWeight: 800 }}>dluh.voluntia.cz</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter800, weight: 800, style: 'normal' },
      ],
      headers: {
        // Edge drží obrázek hodinu, takže se funkce spustí nejvýš 24× denně.
        'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
