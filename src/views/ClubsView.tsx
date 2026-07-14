import { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Search, Trophy, Users } from 'lucide-react';
import { COLORADO_CLUBS, TOURNAMENTS } from '../data/constants';

type FilterLevel = 'all' | 'beginner' | 'club' | 'rated' | 'master' | 'local' | 'state' | 'national';

export function ClubsView() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Colorado Springs, CO');
  const [filter, setFilter] = useState<FilterLevel>('all');
  const [tab, setTab] = useState<'clubs' | 'tournaments'>('clubs');

  const filteredClubs = useMemo(() => {
    return COLORADO_CLUBS.filter((club) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.city.toLowerCase().includes(q) ||
        club.description.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || club.level === filter;
      return matchesQuery && matchesFilter;
    }).sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));
  }, [query, filter]);

  const filteredTournaments = useMemo(() => {
    return TOURNAMENTS.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.organizer.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || t.level === filter;
      const isLocal = location.toLowerCase().includes('colorado springs')
        ? t.city.toLowerCase().includes('colorado springs') || t.state === 'CO'
        : true;
      return matchesQuery && matchesFilter && isLocal;
    });
  }, [query, filter, location]);

  const levelLabel = (level: string) => {
    const map: Record<string, string> = {
      beginner: 'Beginner',
      club: 'Club',
      rated: 'USCF Rated',
      master: 'Master/Titled',
      local: 'Local',
      state: 'State',
      national: 'National',
      master2: 'Master',
    };
    return map[level] ?? level;
  };

  return (
    <div className="clubs-view">
      <header className="clubs-header">
        <div>
          <h2>Clubs & Competitions</h2>
          <p>Find OTB chess near you — from casual club nights to state championships and master events.</p>
        </div>
        <div className="location-badge">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
      </header>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search clubs, tournaments, organizers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          className="location-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Your location"
        />
      </div>

      <div className="sub-tabs">
        <button type="button" className={tab === 'clubs' ? 'active' : ''} onClick={() => setTab('clubs')}>
          <Users size={16} /> Clubs ({filteredClubs.length})
        </button>
        <button type="button" className={tab === 'tournaments' ? 'active' : ''} onClick={() => setTab('tournaments')}>
          <Trophy size={16} /> Tournaments ({filteredTournaments.length})
        </button>
      </div>

      <div className="filter-chips">
        {(['all', 'beginner', 'club', 'rated', 'master', 'local', 'state'] as FilterLevel[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : levelLabel(f)}
          </button>
        ))}
      </div>

      {tab === 'clubs' && (
        <div className="clubs-grid">
          {filteredClubs.map((club) => (
            <article key={club.id} className="club-card">
              <div className="club-card-header">
                <h3>{club.name}</h3>
                <span className={`level-tag level-${club.level}`}>{levelLabel(club.level)}</span>
              </div>
              <p className="club-address">
                <MapPin size={14} /> {club.address}
              </p>
              <p className="club-schedule">{club.schedule}</p>
              <p>{club.description}</p>
              <div className="club-meta">
                {club.uscfRated && <span className="uscf-badge">USCF Rated</span>}
                {club.distanceMiles !== undefined && (
                  <span className="distance">{club.distanceMiles} mi away</span>
                )}
              </div>
              {club.website && (
                <a href={club.website} target="_blank" rel="noopener noreferrer" className="club-link">
                  View details <ExternalLink size={14} />
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === 'tournaments' && (
        <div className="tournament-list">
          {filteredTournaments.map((t) => (
            <article key={t.id} className="tournament-card">
              <div className="tournament-date">
                <span>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {t.endDate && (
                  <span> – {new Date(t.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>
              <div className="tournament-body">
                <h3>{t.name}</h3>
                <p>{t.city}{t.state ? `, ${t.state}` : ''} · {t.format} · {t.entryFee}</p>
                <div className="tournament-meta">
                  <span className={`level-tag level-${t.level}`}>{levelLabel(t.level)}</span>
                  {t.uscfRated && <span className="uscf-badge">USCF</span>}
                  <span className="organizer">{t.organizer}</span>
                </div>
              </div>
              {t.url && (
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="tournament-link">
                  Register <ExternalLink size={14} />
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      <section className="clubs-resources">
        <h3>Colorado Chess Resources</h3>
        <ul>
          <li><a href="https://coloradochess.com" target="_blank" rel="noopener noreferrer">Colorado State Chess Association (CSCA)</a></li>
          <li><a href="https://chesstournamentguide.com/events/state/co/" target="_blank" rel="noopener noreferrer">Chess Tournament Guide — Colorado</a></li>
          <li><a href="https://new.uschess.org/msa/" target="_blank" rel="noopener noreferrer">US Chess MSA (Rating Lookup)</a></li>
        </ul>
      </section>
    </div>
  );
}
