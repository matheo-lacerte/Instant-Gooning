src/pages/Dev/DevGameDetail/devGameDetail.jsx [316:333]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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



src/pages/GameDetail/GameDetail.jsx [187:204]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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



