src/pages/Dev/DevGameDetail/devGameDetail.jsx [304:336]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        <span className="icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Retour</span>
      </Link>

      <section
        className="game-hero"
        style={{
          backgroundImage: game.cover_url
            ? `linear-gradient(180deg, rgba(10,12,16,0.8), rgba(10,12,16,0.95)), url(${game.cover_url})`
            : undefined,
        }}
        aria-label="En-tête du jeu"
      >
        <div className="detail-header">
          <div className="gd-cover">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} />
            ) : (
              <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
            )}
          </div>
          <div className="meta">
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [194:226]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        <span className="icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Retour</span>
      </Link>

      <section
        className="game-hero"
        style={{
          backgroundImage: game.cover_url
            ? `linear-gradient(180deg, rgba(10,12,16,0.8), rgba(10,12,16,0.95)), url(${game.cover_url})`
            : undefined,
        }}
        aria-label="En-tête du jeu"
      >
        <div className="detail-header">
          <div className="gd-cover">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} />
            ) : (
              <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
            )}
          </div>
          <div className="meta">
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



