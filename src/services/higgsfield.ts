/**
 * Client-side AI theme service.
 * Live Higgsfield calls go through /api/ai/* (server-only — V2 SDK blocks browsers).
 * Falls back to procedural / curated generators when the proxy is unavailable.
 */

import {
  generateProceduralTheme,
  getCuratedTheme,
  type ThemeGenerationResult,
  type BoardThemeConfig,
} from './themeAlternatives';

export type ThemeProvider = 'auto' | 'higgsfield' | 'procedural' | 'curated';

export interface GenerateBoardThemeRequest {
  prompt: string;
  style?: 'traditional' | 'neo' | 'competition';
  provider?: ThemeProvider;
  curatedId?: string;
}

export type GenerateBoardThemeResponse = ThemeGenerationResult;

export interface GenerateReplayResponse {
  videoUrl?: string;
  description: string;
  source: 'higgsfield' | 'fallback';
}

async function callProxy<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function generateBoardTheme(
  request: GenerateBoardThemeRequest,
): Promise<GenerateBoardThemeResponse> {
  const provider = request.provider ?? 'auto';
  const style = request.style ?? 'neo';

  if (provider === 'curated' || request.curatedId) {
    const id = (request.curatedId ?? 'neoGlass') as Parameters<typeof getCuratedTheme>[0];
    return getCuratedTheme(id);
  }

  if (provider === 'procedural') {
    return generateProceduralTheme(request.prompt, style);
  }

  if (provider === 'higgsfield' || provider === 'auto') {
    const remote = await callProxy<GenerateBoardThemeResponse>('/api/ai/board-theme', {
      prompt: request.prompt,
      style,
    });
    if (remote?.themeConfig) {
      return { ...remote, source: 'higgsfield' };
    }
    if (provider === 'higgsfield') {
      return {
        source: 'higgsfield',
        description:
          'Higgsfield proxy unavailable. Set HF_CREDENTIALS (or HF_API_KEY + HF_API_SECRET) and restart `npm run dev`. Falling back to procedural theme.',
        themeConfig: generateProceduralTheme(request.prompt, style).themeConfig,
      };
    }
  }

  return generateProceduralTheme(request.prompt, style);
}

export async function generateGameReplay(pgn: string): Promise<GenerateReplayResponse> {
  const remote = await callProxy<GenerateReplayResponse>('/api/ai/replay', { pgn });
  if (remote) return { ...remote, source: remote.source ?? 'higgsfield' };

  return {
    source: 'fallback',
    description:
      'Cinematic replay requires HF_CREDENTIALS on the server. Export your PGN and use Premium once credentials are configured.',
  };
}

export async function generateOpponentAvatar(
  personality: string,
): Promise<{ previewUrl?: string; description: string; themeConfig?: BoardThemeConfig }> {
  const remote = await callProxy<{ previewUrl?: string; description: string }>(
    '/api/ai/avatar',
    { personality },
  );
  if (remote) return remote;

  const theme = generateProceduralTheme(`avatar ${personality}`, 'neo');
  return {
    description: `Avatar preview for "${personality}" (procedural). Connect Higgsfield for live Soul/FLUX portraits.`,
    themeConfig: theme.themeConfig,
  };
}

/** Compatibility helpers for older call sites expecting themeConfig only */
export type { BoardThemeConfig };
