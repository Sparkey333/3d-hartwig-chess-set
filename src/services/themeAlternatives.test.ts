import { describe, expect, it } from 'vitest';
import {
  generateProceduralTheme,
  getCuratedTheme,
  listCuratedThemes,
  CURATED_THEMES,
} from './themeAlternatives';

describe('theme alternatives', () => {
  it('lists curated skins', () => {
    expect(listCuratedThemes().length).toBe(Object.keys(CURATED_THEMES).length);
  });

  it('is deterministic for the same prompt', () => {
    const a = generateProceduralTheme('neon glass cyberpunk', 'neo');
    const b = generateProceduralTheme('neon glass cyberpunk', 'neo');
    expect(a.themeConfig.lightSquare).toBe(b.themeConfig.lightSquare);
    expect(a.themeConfig.darkSquare).toBe(b.themeConfig.darkSquare);
    expect(a.source).toBe('procedural');
  });

  it('returns curated neo glass', () => {
    const t = getCuratedTheme('neoGlass');
    expect(t.source).toBe('curated');
    expect(t.themeConfig.pieceStyle).toBe('neo-glass');
  });
});
