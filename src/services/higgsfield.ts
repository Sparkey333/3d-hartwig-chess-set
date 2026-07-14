/**
 * Client AI service — talks to local /api/ai proxy (Higgsfield + alternatives).
 * Falls back to procedural themes when the proxy is offline.
 */

export type AiProvider = 'auto' | 'higgsfield' | 'openai' | 'procedural';

export interface BoardThemeResult {
  provider: string;
  mode: 'live' | 'fallback';
  description: string;
  previewUrl?: string | null;
  themeConfig: {
    lightSquare: string;
    darkSquare: string;
    highlightColor: string;
    pieceStyle: string;
    boardTexture?: string;
  };
}

export interface AiStatus {
  higgsfield: boolean;
  openai: boolean;
  replicate: boolean;
  procedural: boolean;
}

function proceduralFallback(prompt: string, style: string): BoardThemeResult {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h * 31 + prompt.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    provider: 'procedural',
    mode: 'fallback',
    description: `Offline procedural theme for "${prompt || 'default'}" (${style}). Start ai-proxy with HF_CREDENTIALS for live Higgsfield.`,
    previewUrl: null,
    themeConfig: {
      lightSquare: style === 'traditional' ? '#e8d5b5' : `hsl(${(hue + 40) % 360} 28% 24%)`,
      darkSquare: style === 'traditional' ? '#8b5a2b' : `hsl(${(hue + 200) % 360} 40% 11%)`,
      highlightColor: `hsl(${hue} 80% 60%)`,
      pieceStyle: style === 'competition' ? 'neo-steel' : style === 'traditional' ? 'hartwig-classic' : 'neo-glass',
      boardTexture: style,
    },
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`AI proxy ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getAiStatus(): Promise<AiStatus> {
  try {
    const response = await fetch('/api/ai/status');
    if (!response.ok) throw new Error('offline');
    return response.json();
  } catch {
    return { higgsfield: false, openai: false, replicate: false, procedural: true };
  }
}

export async function generateBoardTheme(input: {
  prompt: string;
  style?: 'traditional' | 'neo' | 'competition';
  provider?: AiProvider;
}): Promise<BoardThemeResult> {
  const style = input.style ?? 'neo';
  try {
    return await postJson<BoardThemeResult>('/api/ai/board-theme', {
      prompt: input.prompt,
      style,
      provider: input.provider ?? 'auto',
    });
  } catch {
    return proceduralFallback(input.prompt, style);
  }
}

export async function generateCoachNotes(input: {
  fen?: string;
  pgn?: string;
}): Promise<{ provider: string; headline: string; notes: string[] }> {
  try {
    return await postJson('/api/ai/coach', input);
  } catch {
    return {
      provider: 'local',
      headline: 'Neo Coach (offline)',
      notes: [
        'Prioritize king safety before pawn storms.',
        'Trade when ahead; keep tension when behind.',
        'Every move should improve a piece or create a concrete threat.',
      ],
    };
  }
}

export async function generateGameReplay(pgn: string): Promise<{
  description: string;
  videoUrl?: string | null;
  provider?: string;
}> {
  try {
    return await postJson('/api/ai/replay', { pgn });
  } catch {
    return {
      provider: 'offline',
      description: 'Replay service offline. Start `npm run ai:proxy` with HF_CREDENTIALS for Higgsfield image-to-video.',
      videoUrl: null,
    };
  }
}

/** @deprecated use generateBoardTheme — kept for older imports */
export { generateBoardTheme as generateBoardThemeLegacy };
