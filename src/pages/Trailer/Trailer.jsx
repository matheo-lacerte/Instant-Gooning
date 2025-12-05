export default function Trailer(props) {
  {
    const trailerEmbedUrl = props.trailerEmbedUrl;
    const game = props.game;

    return (
      <>
        {trailerEmbedUrl && (
          <section className="media-section">
            <h2 className="section-title">
              <span className="bar" />
              Bande‑annonce
            </h2>
            <div className="video-card">
              {trailerEmbedUrl.includes("/embed/") ? (
                <iframe
                  className="video-frame"
                  src={trailerEmbedUrl}
                  title={`Bande-annonce: ${game.title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video className="video-frame" src={trailerEmbedUrl} controls />
              )}
            </div>
          </section>
        )}
      </>
    );
  }
}
