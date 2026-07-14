import { X } from 'lucide-react';

interface AnalysisPanelProps {
  lines: { depth: number; score: number; pv: string; mate?: number }[];
  fen: string;
  onClose: () => void;
}

export function AnalysisPanel({ lines, fen, onClose }: AnalysisPanelProps) {
  const topLine = lines[0];

  return (
    <aside className="analysis-panel">
      <div className="analysis-header">
        <h3>Stockfish Analysis</h3>
        <button type="button" onClick={onClose} aria-label="Close analysis"><X size={18} /></button>
      </div>
      {topLine ? (
        <>
          <div className="eval-bar">
            <div
              className="eval-fill"
              style={{ width: `${Math.min(100, Math.max(0, 50 + topLine.score / 30))}%` }}
            />
          </div>
          <p className="eval-score">
            {topLine.mate !== undefined
              ? `Mate in ${Math.abs(topLine.mate)}`
              : `${topLine.score > 0 ? '+' : ''}${(topLine.score / 100).toFixed(1)}`}
            <span>depth {topLine.depth}</span>
          </p>
          <p className="engine-pv">{topLine.pv}</p>
        </>
      ) : (
        <p className="muted">Analyzing position…</p>
      )}
      <p className="fen-display">{fen}</p>
    </aside>
  );
}
