import { useState } from 'react';
import type { Basis } from '../shared/model';
import { useLiveDebt } from './useLiveDebt';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Context } from './components/Context';
import { Methodology } from './components/Methodology';
import { ApiDocs } from './components/ApiDocs';
import { Footer } from './components/Footer';

export function App() {
  const [basis, setBasis] = useState<Basis>('obyvatel');
  const debt = useLiveDebt();

  return (
    <div className="page">
      <main className="stage">
        <div className="container stage-inner">
          <Hero debt={debt} />
          {/* `debt.value` se mění každý snímek — metriky se překreslují s ním. */}
          <Metrics basis={basis} onBasisChange={setBasis} now={Date.now()} />
          <Context />
        </div>
      </main>

      <Methodology />
      <ApiDocs />
      <Footer />
    </div>
  );
}
