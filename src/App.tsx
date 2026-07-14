import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PlayView } from './views/PlayView';
import { VariantsView } from './views/VariantsView';
import { ClubsView } from './views/ClubsView';
import { PremiumView } from './views/PremiumView';
import { LearnView } from './views/LearnView';
import { LandingView } from './views/LandingView';
import { PuzzlesView } from './views/PuzzlesView';
import { ExploreView } from './views/ExploreView';
import { StudioView } from './views/StudioView';
import type { VariantId } from './types';

export type Tab =
  | 'landing'
  | 'play'
  | 'variants'
  | 'puzzles'
  | 'explore'
  | 'studio'
  | 'clubs'
  | 'premium'
  | 'learn';

export default function App() {
  const [tab, setTab] = useState<Tab>('landing');
  const [activeVariant, setActiveVariant] = useState<VariantId>('standard');
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const known: Tab[] = ['landing', 'play', 'variants', 'puzzles', 'explore', 'studio', 'clubs', 'premium', 'learn'];
    if (known.includes(hash as Tab)) setTab(hash as Tab);
    if (hash === 'download') setTab('landing');
  }, []);

  const startGame = (variant: VariantId) => {
    setActiveVariant(variant);
    setShowGame(true);
    setTab('play');
  };

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'landing' && (
        <LandingView onPlay={() => setTab('play')} onDownloadFocus={() => setTab('landing')} />
      )}
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
      {tab === 'puzzles' && <PuzzlesView />}
      {tab === 'explore' && <ExploreView />}
      {tab === 'studio' && <StudioView />}
      {tab === 'clubs' && <ClubsView />}
      {tab === 'premium' && <PremiumView />}
      {tab === 'learn' && <LearnView />}
    </Layout>
  );
}
