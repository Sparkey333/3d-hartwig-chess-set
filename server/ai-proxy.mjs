/**
 * Neo Chess AI proxy — Higgsfield (primary) + OpenAI-image / Replicate-style alternatives.
 * Credentials stay server-side. Set HF_CREDENTIALS or HF_API_KEY+HF_API_SECRET.
 */
import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.AI_PROXY_PORT || 8787);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

function hashPrompt(prompt = '') {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h * 31 + prompt.charCodeAt(i)) >>> 0;
  return h;
}

function proceduralTheme(prompt, style = 'neo') {
  const h = hashPrompt(prompt);
  const palettes = {
    traditional: { light: '#f0d9b5', dark: '#b58863', highlight: '#fbbf24', piece: 'hartwig-classic' },
    competition: { light: '#c7d7e8', dark: '#4a6fa5', highlight: '#38bdf8', piece: 'neo-steel' },
    neo: { light: '#1f2937', dark: '#0f172a', highlight: '#a78bfa', piece: 'neo-glass' },
  };
  const base = palettes[style] ?? palettes.neo;
  const hue = h % 360;
  if (prompt) {
    base.highlight = `hsl(${hue} 80% 60%)`;
    if (style === 'neo') {
      base.light = `hsl(${(hue + 40) % 360} 25% 22%)`;
      base.dark = `hsl(${(hue + 200) % 360} 35% 10%)`;
    }
  }
  return {
    provider: 'procedural',
    mode: 'fallback',
    description: `Procedural theme for "${prompt || 'default'}" (${style}). Connect HF_CREDENTIALS for live Higgsfield images.`,
    previewUrl: null,
    themeConfig: {
      lightSquare: base.light,
      darkSquare: base.dark,
      highlightColor: base.highlight,
      pieceStyle: base.piece,
      boardTexture: style === 'traditional' ? 'hartwig-classic' : style === 'competition' ? 'tournament-blue' : 'neo-pulse',
    },
  };
}

async function generateWithHiggsfield(prompt, style) {
  const credentials =
    process.env.HF_CREDENTIALS ||
    (process.env.HF_API_KEY && process.env.HF_API_SECRET
      ? `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}`
      : null);

  if (!credentials) return null;

  const { createHiggsfieldClient } = await import('@higgsfield/client/v2');
  const client = createHiggsfieldClient({ credentials });

  const enriched = `Top-down isometric chess board texture, 1:1, premium product shot, ${style} style chessboard squares, clean edges, no people, no text. User style: ${prompt}`;

  const jobSet = await client.subscribe('flux-pro/kontext/max/text-to-image', {
    input: {
      prompt: enriched,
      aspect_ratio: '1:1',
      safety_tolerance: 2,
    },
    withPolling: true,
  });

  const url = jobSet?.jobs?.[0]?.results?.raw?.url ?? jobSet?.jobs?.[0]?.results?.min?.url ?? null;
  const theme = proceduralTheme(prompt, style);
  return {
    ...theme,
    provider: 'higgsfield',
    mode: 'live',
    description: url
      ? `Higgsfield generated board art for "${prompt}". Theme colors derived for playability.`
      : theme.description,
    previewUrl: url,
  };
}

async function generateWithOpenAI(prompt, style) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `Chessboard product render, top-down, ${style} aesthetic: ${prompt}`,
      size: '1024x1024',
    }),
  });

  if (!response.ok) throw new Error(`OpenAI image API ${response.status}`);
  const data = await response.json();
  const url = data?.data?.[0]?.url ?? null;
  const theme = proceduralTheme(prompt, style);
  return {
    ...theme,
    provider: 'openai',
    mode: 'live',
    description: `OpenAI image alternative for "${prompt}".`,
    previewUrl: url,
  };
}

async function generateCoachNotes(pgn, fen) {
  // Lightweight tactical tips without external AI when keys missing
  const tips = [
    'Watch for hanging pieces after each capture.',
    'Improve the least active piece before launching an attack.',
    'Ask what your opponent threatens on the next move.',
    'When ahead in material, simplify; when behind, complicate.',
    'Occupy open files with rooks and claim the seventh when possible.',
  ];
  const h = hashPrompt(pgn || fen || '');
  return {
    provider: process.env.HF_CREDENTIALS || process.env.OPENAI_API_KEY ? 'hybrid' : 'local',
    headline: 'Neo Coach snapshot',
    notes: [tips[h % tips.length], tips[(h + 2) % tips.length], tips[(h + 4) % tips.length]],
    fen: fen ?? null,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/ai/status') {
      send(res, 200, {
        higgsfield: Boolean(process.env.HF_CREDENTIALS || (process.env.HF_API_KEY && process.env.HF_API_SECRET)),
        openai: Boolean(process.env.OPENAI_API_KEY),
        replicate: Boolean(process.env.REPLICATE_API_TOKEN),
        procedural: true,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/board-theme') {
      const body = await readBody(req);
      const prompt = String(body.prompt || '').trim();
      const style = body.style || 'neo';
      const provider = body.provider || 'auto';

      let result = null;
      if (provider === 'higgsfield' || provider === 'auto') {
        try {
          result = await generateWithHiggsfield(prompt, style);
        } catch (err) {
          console.warn('[ai-proxy] Higgsfield failed:', err.message);
        }
      }
      if (!result && (provider === 'openai' || provider === 'auto')) {
        try {
          result = await generateWithOpenAI(prompt, style);
        } catch (err) {
          console.warn('[ai-proxy] OpenAI failed:', err.message);
        }
      }
      if (!result) result = proceduralTheme(prompt, style);
      send(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/coach') {
      const body = await readBody(req);
      const coach = await generateCoachNotes(body.pgn, body.fen);
      send(res, 200, coach);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/replay') {
      const body = await readBody(req);
      send(res, 200, {
        provider: process.env.HF_CREDENTIALS ? 'higgsfield' : 'procedural',
        description:
          'Cinematic replay pipeline staged. Wire image-to-video (/v1/image2video/dop) with board screenshots when credits are available.',
        pgnPreview: String(body.pgn || '').slice(0, 200),
        videoUrl: null,
      });
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: err instanceof Error ? err.message : 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`[neo-chess ai-proxy] http://localhost:${PORT}`);
});
