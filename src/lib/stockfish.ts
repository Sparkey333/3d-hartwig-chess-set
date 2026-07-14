import type { EngineLine } from '../types';

type EngineCallback = (lines: EngineLine[], depth: number) => void;

let worker: Worker | null = null;
let ready = false;
let callback: EngineCallback | null = null;

export function initStockfish(onReady?: () => void): void {
  if (worker) return;

  try {
    worker = new Worker(new URL('../workers/stockfishWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<string>) => {
      const msg = e.data;
      if (msg === 'ready') {
        ready = true;
        onReady?.();
        return;
      }
      parseEngineOutput(msg);
    };

    worker.postMessage('uci');
    worker.postMessage('isready');
  } catch {
    // Fallback: engine unavailable in some environments
    ready = false;
  }
}

export function analyzePosition(fen: string, cb: EngineCallback, depth = 18): void {
  callback = cb;
  if (!worker || !ready) return;
  worker.postMessage(`position fen ${fen}`);
  worker.postMessage(`go depth ${depth}`);
}

export function stopAnalysis(): void {
  worker?.postMessage('stop');
}

export function getBestMove(fen: string, skillLevel: number): Promise<string | null> {
  return new Promise((resolve) => {
    if (!worker || !ready) {
      resolve(null);
      return;
    }

    const handler = (e: MessageEvent<string>) => {
      const msg = e.data;
      if (msg.startsWith('bestmove')) {
        worker?.removeEventListener('message', handler);
        const move = msg.split(' ')[1];
        resolve(move === '(none)' ? null : move);
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage('go depth 10');
  });
}

function parseEngineOutput(msg: string): void {
  if (!msg.startsWith('info') || !callback) return;

  const depthMatch = msg.match(/depth (\d+)/);
  const scoreMatch = msg.match(/score cp (-?\d+)/);
  const mateMatch = msg.match(/score mate (-?\d+)/);
  const pvMatch = msg.match(/ pv (.+)/);

  if (!depthMatch || !pvMatch) return;

  const depth = parseInt(depthMatch[1], 10);
  const line: EngineLine = {
    depth,
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    pv: pvMatch[1],
    mate: mateMatch ? parseInt(mateMatch[1], 10) : undefined,
  };

  callback([line], depth);
}

export function destroyEngine(): void {
  worker?.terminate();
  worker = null;
  ready = false;
}

export function isEngineReady(): boolean {
  return ready;
}
