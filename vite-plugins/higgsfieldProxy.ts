/**
 * Vite plugin: server-side Higgsfield AI proxy.
 *
 * The official @higgsfield/client V2 SDK blocks browser usage.
 * Credentials stay on the Node process (HF_CREDENTIALS or HF_API_KEY/HF_API_SECRET).
 */

import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function getCredentials(): string | null {
  if (process.env.HF_CREDENTIALS?.includes(':')) return process.env.HF_CREDENTIALS;
  const key = process.env.HF_API_KEY ?? process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HF_API_SECRET ?? process.env.HIGGSFIELD_API_SECRET;
  if (key && secret) return `${key}:${secret}`;
  // Legacy single-key mistakenly put in VITE_ — refuse (would expose to client if set)
  return null;
}

async function withHiggsfield<T>(
  run: (subscribe: (endpoint: string, opts: unknown) => Promise<unknown>) => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const credentials = getCredentials();
  if (!credentials) {
    return {
      ok: false,
      error: 'Missing HF_CREDENTIALS (format KEY_ID:KEY_SECRET). Server-only — do not use VITE_ prefixes.',
    };
  }

  try {
    const mod = await import('@higgsfield/client/v2');
    const { createHiggsfieldClient } = mod as {
      createHiggsfieldClient: (opts: { credentials: string; timeout?: number }) => {
        subscribe: (endpoint: string, opts: unknown) => Promise<unknown>;
      };
    };
    const client = createHiggsfieldClient({ credentials, timeout: 120000 });
    const data = await run(client.subscribe.bind(client));
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Higgsfield request failed',
    };
  }
}

function extractImageUrl(jobSet: unknown): string | undefined {
  const js = jobSet as {
    isCompleted?: boolean;
    jobs?: Array<{ results?: { raw?: { url?: string }; min?: { url?: string } } }>;
    images?: Array<{ url?: string }>;
  };
  return (
    js.jobs?.[0]?.results?.raw?.url ??
    js.jobs?.[0]?.results?.min?.url ??
    js.images?.[0]?.url
  );
}

function extractVideoUrl(jobSet: unknown): string | undefined {
  const js = jobSet as {
    jobs?: Array<{ results?: { raw?: { url?: string } } }>;
    video?: { url?: string };
  };
  return js.jobs?.[0]?.results?.raw?.url ?? js.video?.url;
}

function styleHints(style?: string): string {
  if (style === 'traditional') return 'classic wooden chess aesthetic, warm oak and walnut, elegant FIDE board';
  if (style === 'competition') return 'high contrast tournament board, clean modern competition style';
  return 'futuristic neo chess board, glass pieces, subtle neon accents, cinematic lighting';
}

export function higgsfieldProxyPlugin(): Plugin {
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/ai/')) return next();
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(await readBody(req)) as Record<string, unknown>;
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON' });
      return;
    }

    if (req.url === '/api/ai/board-theme') {
      const prompt = String(body.prompt ?? '');
      const style = String(body.style ?? 'neo');
      const composed = `Top-down chess board texture map, 1:1, ${styleHints(style)}. ${prompt}`.trim();

      const result = await withHiggsfield(async (subscribe) => {
        const jobSet = await subscribe('flux-pro/kontext/max/text-to-image', {
          input: {
            aspect_ratio: '1:1',
            prompt: composed,
            safety_tolerance: 2,
          },
          withPolling: true,
        });
        const previewUrl = extractImageUrl(jobSet);
        return {
          source: 'higgsfield',
          description: `Higgsfield FLUX board theme for "${prompt}"`,
          previewUrl,
          themeConfig: {
            lightSquare: style === 'traditional' ? '#f0d9b5' : '#e0e7ff',
            darkSquare: style === 'traditional' ? '#b58863' : '#1e1b4b',
            highlightColor: '#a78bfa',
            pieceStyle: 'higgsfield-generated',
            boardLabel: prompt.slice(0, 48) || 'Higgsfield Board',
            accent: '#6366f1',
          },
        };
      });

      if (!result.ok) {
        sendJson(res, 503, { error: result.error });
        return;
      }
      sendJson(res, 200, result.data);
      return;
    }

    if (req.url === '/api/ai/avatar') {
      const personality = String(body.personality ?? 'calm rival');
      const result = await withHiggsfield(async (subscribe) => {
        const jobSet = await subscribe('flux-pro/kontext/max/text-to-image', {
          input: {
            aspect_ratio: '1:1',
            prompt: `Portrait of a chess opponent character: ${personality}, stylized, no text, dramatic lighting`,
            safety_tolerance: 2,
          },
          withPolling: true,
        });
        return {
          previewUrl: extractImageUrl(jobSet),
          description: `Higgsfield avatar for "${personality}"`,
        };
      });
      if (!result.ok) {
        sendJson(res, 503, { error: result.error });
        return;
      }
      sendJson(res, 200, result.data);
      return;
    }

    if (req.url === '/api/ai/replay') {
      const pgn = String(body.pgn ?? '');
      const result = await withHiggsfield(async (subscribe) => {
        // Image keyframe first; image-to-video when a still is available
        const still = await subscribe('flux-pro/kontext/max/text-to-image', {
          input: {
            aspect_ratio: '16:9',
            prompt: `Cinematic chess match keyframe from PGN study, dramatic overhead board, ${pgn.slice(0, 200)}`,
            safety_tolerance: 2,
          },
          withPolling: true,
        });
        const imageUrl = extractImageUrl(still);
        if (!imageUrl) {
          return {
            source: 'higgsfield',
            description: 'Generated keyframe only — no image URL returned for video pass.',
          };
        }
        try {
          const video = await subscribe('/v1/image2video/dop', {
            input: {
              model: 'dop-turbo',
              prompt: 'Cinematic camera orbit around a chess board, slow dramatic push-in',
              input_images: [{ type: 'image_url', image_url: imageUrl }],
            },
            withPolling: true,
          });
          return {
            source: 'higgsfield',
            videoUrl: extractVideoUrl(video),
            description: 'Higgsfield cinematic replay (DoP turbo)',
            previewUrl: imageUrl,
          };
        } catch {
          return {
            source: 'higgsfield',
            description: 'Keyframe ready; image-to-video pass unavailable. Use preview still.',
            previewUrl: imageUrl,
          };
        }
      });
      if (!result.ok) {
        sendJson(res, 503, { error: result.error });
        return;
      }
      sendJson(res, 200, result.data);
      return;
    }

    sendJson(res, 404, { error: 'Unknown AI endpoint' });
  };

  return {
    name: 'higgsfield-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
