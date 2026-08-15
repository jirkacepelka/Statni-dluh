import { useState } from 'react';
import { DEFAULT_PUBLIC_SECTOR, type Basis, type PublicSector } from '../shared/model';
import { useLiveDebt } from './useLiveDebt';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Context } from './components/Context';
import { Footer } from './components/Footer';

export function App() {
  const [basis, setBasis] = useState<Basis>('obyvatel');
  const [publicSector, setPublicSector] = useState<PublicSector>(DEFAULT_PUBLIC_SECTOR);
  const debt = useLiveDebt();

  return (
    <div className="page">
      <main className="stage">
        <div className="container stage-inner">
          <Hero debt={debt} />
          {/* Metriky se přepočítávají spolu s počítadlem, jednou za vteřinu. */}
          <Metrics
            basis={basis}
            onBasisChange={setBasis}
            publicSector={publicSector}
            onPublicSectorChange={setPublicSector}
            now={Date.now()}
          />
          <Context />
        </div>
      </main>

      <Footer />
    </div>
  );
}
