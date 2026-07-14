/**
 * Higgsfield AI integration for premium features.
 * Set HIGGSFIELD_API_KEY in .env to enable live generation.
 */

export interface GenerateBoardThemeRequest {
  prompt: string;
  style?: 'traditional' | 'neo' | 'competition';
}

export interface GenerateBoardThemeResponse {
  previewUrl?: string;
  description: string;
  themeConfig: {
    lightSquare: string;
    darkSquare: string;
    highlightColor: string;
    pieceStyle: string;
  };
}

const API_BASE = import.meta.env.VITE_HIGGSFIELD_API_URL ?? 'https://api.higgsfield.ai/v1';

export async function generateBoardTheme(
  request: GenerateBoardThemeRequest,
): Promise<GenerateBoardThemeResponse> {
  const apiKey = import.meta.env.VITE_HIGGSFIELD_API_KEY;

  if (!apiKey) {
    return {
      description: `Preview for "${request.prompt}" — Connect VITE_HIGGSFIELD_API_KEY for live AI generation.`,
      themeConfig: {
        lightSquare: '#f0d9b5',
        darkSquare: '#1a1a2e',
        highlightColor: '#6366f1',
        pieceStyle: 'neo-glass',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE}/generate/board-theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`Higgsfield API error: ${response.status}`);
    return await response.json();
  } catch (err) {
    return {
      description: `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}. Using fallback theme.`,
      themeConfig: {
        lightSquare: '#f0d9b5',
        darkSquare: '#1a1a2e',
        highlightColor: '#6366f1',
        pieceStyle: 'fallback',
      },
    };
  }
}

export async function generateGameReplay(
  pgn: string,
): Promise<{ videoUrl?: string; description: string }> {
  const apiKey = import.meta.env.VITE_HIGGSFIELD_API_KEY;
  if (!apiKey) {
    return {
      description: 'Cinematic replay generation requires Elite subscription and HIGGSFIELD_API_KEY.',
    };
  }

  const response = await fetch(`${API_BASE}/generate/chess-replay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ pgn }),
  });

  if (!response.ok) throw new Error('Replay generation failed');
  return response.json();
}
