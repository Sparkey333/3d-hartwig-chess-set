import { RESEARCH_INSIGHTS } from '../data/constants';

export function LearnView() {
  return (
    <div className="learn-view">
      <header>
        <h2>Research & Product Insights</h2>
        <p>
          What we learned from Lichess, Chess.com, FIDE, and the Colorado OTB scene — and how Neo Chess
          addresses the gaps.
        </p>
      </header>

      <section className="insights-grid">
        {RESEARCH_INSIGHTS.map((item) => (
          <article key={item.source} className="insight-card">
            <span className="source-tag">{item.source}</span>
            <p>{item.insight}</p>
          </article>
        ))}
      </section>

      <section className="comparison">
        <h3>Neo Chess vs. The Field</h3>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Lichess</th>
              <th>Chess.com</th>
              <th>Neo Chess</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Variants (960, Atomic, etc.)', '✓', '✓', '✓'],
              ['Integrated game review UI', '✓', 'Partial', '✓ (side-by-side moves)'],
              ['Local club finder', '—', '—', '✓ Colorado focus'],
              ['AI board generation', '—', '—', '✓ Higgsfield'],
              ['Neo visual modes (Pulse, Fog)', '—', 'Partial', '✓'],
              ['Opening explorer (all games)', '✓', 'Masters only', 'Planned'],
              ['Time-odds handicaps', '—', 'Partial', 'Planned'],
              ['Cinematic AI replays', '—', '—', '✓ Elite'],
              ['Open source engine', '✓', '—', '✓ Stockfish'],
            ].map(([feature, lichess, chesscom, neo]) => (
              <tr key={feature}>
                <td>{feature}</td>
                <td>{lichess}</td>
                <td>{chesscom}</td>
                <td className="neo-col">{neo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="tech-stack">
        <h3>Open Source Foundations</h3>
        <ul>
          <li><strong>chess.js</strong> — Move validation and game logic (used by Lichess & Chess.com)</li>
          <li><strong>react-chessboard</strong> — Modern React board UI built on chessground concepts</li>
          <li><strong>Stockfish</strong> — Strongest open-source engine for analysis and AI opponents</li>
          <li><strong>Legacy 3D Hartwig set</strong> — Original CSS/JS 3D board preserved in <code>/legacy</code></li>
        </ul>
      </section>

      <section className="roadmap">
        <h3>Phase status</h3>
        <ol>
          <li>✅ Higgsfield AI proxy + OpenAI/procedural alternatives</li>
          <li>✅ Hartwig theme upgrades + Neo asset studio</li>
          <li>✅ Opening explorer seed + handicaps (piece/time odds)</li>
          <li>✅ Puzzle arena + PWA shell</li>
          <li>✅ Crazyhouse reserves/drops + Fog of War piece hiding</li>
          <li>🔜 Multiplayer WebSocket + Bughouse</li>
          <li>🔜 Aggregated online opening DB + USCF registration deep-links</li>
          <li>🔜 Soul ID avatars + full image-to-video replay exports</li>
        </ol>
      </section>
    </div>
  );
}
