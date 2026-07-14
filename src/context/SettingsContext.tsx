import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  BOARD_THEMES,
  PIECE_SETS,
  HANDICAPS,
  type BoardTheme,
  type BoardThemeId,
  type PieceSetId,
  type HandicapId,
} from '../data/themes';

export type AiProviderId = 'auto' | 'higgsfield' | 'openai' | 'procedural';

interface SettingsState {
  boardThemeId: BoardThemeId;
  pieceSetId: PieceSetId;
  handicapId: HandicapId;
  aiProvider: AiProviderId;
  customTheme: BoardTheme | null;
  setBoardThemeId: (id: BoardThemeId) => void;
  setPieceSetId: (id: PieceSetId) => void;
  setHandicapId: (id: HandicapId) => void;
  setAiProvider: (id: AiProviderId) => void;
  applyCustomTheme: (theme: BoardTheme) => void;
  activeBoardTheme: BoardTheme;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [boardThemeId, setBoardThemeId] = useState<BoardThemeId>('neo-pulse');
  const [pieceSetId, setPieceSetId] = useState<PieceSetId>('neo-standard');
  const [handicapId, setHandicapId] = useState<HandicapId>('none');
  const [aiProvider, setAiProvider] = useState<AiProviderId>('auto');
  const [customTheme, setCustomTheme] = useState<BoardTheme | null>(null);

  const activeBoardTheme = useMemo(() => {
    if (boardThemeId === 'ai-custom' && customTheme) return customTheme;
    return BOARD_THEMES.find((t) => t.id === boardThemeId) ?? BOARD_THEMES[3];
  }, [boardThemeId, customTheme]);

  const value: SettingsState = {
    boardThemeId,
    pieceSetId,
    handicapId,
    aiProvider,
    customTheme,
    setBoardThemeId,
    setPieceSetId,
    setHandicapId,
    setAiProvider,
    applyCustomTheme: (theme) => {
      setCustomTheme(theme);
      setBoardThemeId('ai-custom');
    },
    activeBoardTheme,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export { BOARD_THEMES, PIECE_SETS, HANDICAPS };
