import type { ReactNode } from 'react';
import {
  Crown,
  MapPin,
  Sparkles,
  BookOpen,
  Gamepad2,
  Home,
  Puzzle,
  Compass,
  Palette,
  KeyRound,
} from 'lucide-react';
import type { Tab } from '../App';

interface LayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
}

const TABS: { id: Tab; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'setup', label: 'Setup', icon: KeyRound },
  { id: 'play', label: 'Play', icon: Gamepad2 },
  { id: 'variants', label: 'Variants', icon: Crown },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { id: 'explore', label: 'Openings', icon: Compass },
  { id: 'studio', label: 'Studio', icon: Palette },
  { id: 'clubs', label: 'Clubs', icon: MapPin },
  { id: 'premium', label: 'Premium', icon: Sparkles },
  { id: 'learn', label: 'Research', icon: BookOpen },
];

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">♞</div>
          <div>
            <h1>Neo Chess</h1>
            <p>Traditional · Competition · Neo</p>
          </div>
        </div>
        <nav className="tab-nav" aria-label="Main navigation">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => onTabChange(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>chess.js · react-chessboard · Stockfish · Higgsfield AI</span>
        <span>Colorado Springs, CO · Mac builds → Downloads</span>
      </footer>
    </div>
  );
}
