/// <reference lib="webworker" />

interface StockfishEngine {
  postMessage: (cmd: string) => void;
  onmessage: ((e: { data: string }) => void) | null;
}

declare function STOCKFISH(): StockfishEngine;

let engine: StockfishEngine | null = null;

async function loadEngine() {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    importScripts(url);

    engine = STOCKFISH();
    engine.onmessage = (e: { data: string }) => {
      self.postMessage(e.data);
      if (e.data === 'readyok') self.postMessage('ready');
    };

    engine.postMessage('uci');
    engine.postMessage('isready');
  } catch {
    self.postMessage('ready');
  }
}

self.onmessage = (e: MessageEvent<string>) => {
  if (!engine) {
    loadEngine().then(() => engine?.postMessage(e.data));
  } else {
    engine.postMessage(e.data);
  }
};

export {};
