import { useState } from 'react';
import { Layout } from './components/Layout';
import { PlayView } from './views/PlayView';
import { VariantsView } from './views/VariantsView';
import { ClubsView } from './views/ClubsView';
import { PremiumView } from './views/PremiumView';
import { LearnView } from './views/LearnView';
import type { VariantId } from './types';

export type Tab = 'play' | 'variants' | 'clubs' | 'premium' | 'learn';

export default function App() {
  const [tab, setTab] = useState<Tab>('play');
  const [activeVariant, setActiveVariant] = useState<VariantId>('standard');
  const [showGame, setShowGame] = useState(false);

  const startGame = (variant: VariantId) => {
    setActiveVariant(variant);
    setShowGame(true);
    setTab('play');
  };

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'play' && (
        <PlayView
          variant={activeVariant}
          showGame={showGame}
          onStartGame={startGame}
          onExitGame={() => setShowGame(false)}
          onVariantChange={setActiveVariant}
        />
      )}
      {tab === 'variants' && <VariantsView onSelect={startGame} />}
      {tab === 'clubs' && <ClubsView />}
      {tab === 'premium' && <PremiumView />}
      {tab === 'learn' && <LearnView />}
    </Layout>
  );
}
