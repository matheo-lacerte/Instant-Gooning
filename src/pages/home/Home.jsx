import GameCard from "../../app/components/GameCard";
import SearchBar from "../../app/components/SearchBar";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";
import "./home.css";

export default function Home() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [listeJeux, setListeJeux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("default"); // default|price-asc|price-desc|alpha
    const [filterKey, setFilterKey] = useState("all");

    // Keep only active games across all sections
    const activeGames = useMemo(
      () => (Array.isArray(listeJeux) ? listeJeux.filter((g) => g?.is_active === true) : []),
      [listeJeux]
    );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        let data = null;

          const response = await fetch("http://localhost:5174/api/games/getAllGames", { method: "GET" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          data = await response.json();

        if (!cancelled) setListeJeux(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // compute sections
  const promos = useMemo(
     () => activeGames.filter((j) => Number(j?.discount) > 0),
     [activeGames]
  );
  const bestDeal = useMemo(() => {
    if (!promos.length) return null;
    return promos.reduce((best, g) => (g.discount > (best?.discount ?? -1) ? g : best), promos[0]);
  }, [promos]);


  const sortedAll = useMemo(() => {
      const arr = [...activeGames];
    if (sortKey === "price-asc") arr.sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
    else if (sortKey === "price-desc") arr.sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
    else if (sortKey === "alpha") arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return arr;
    }, [activeGames, sortKey]);

  const recentIds = useMemo(() => {
    try {
      const raw = localStorage.getItem("ig_recent");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(0, 10) : [];
    } catch { return []; }
  }, []);

  const recentGames = useMemo(() => {
      if (!recentIds.length || !activeGames.length) return [];
      const map = new Map(activeGames.map((g) => [g.id, g]));
    const res = [];
    for (const id of recentIds) {
      const g = map.get(id);
      if (g) res.push(g);
    }
      return res;
    }, [activeGames, recentIds]);


  return (
    <div className="wrap">
      <div className="search-section">
        <SearchBar
          value={auth.search}
          onChange={auth.setSearch}
          onSubmit={(qArg) => {
            const q = (qArg ?? auth.search ?? "").trim();
            if (!q) return;
            navigate(`/search?search=${encodeURIComponent(q)}`);
          }}
          placeholder="Rechercher un jeu..."
        />
      </div>

      {bestDeal && (
        <section className="hero" aria-label="À la une">
          <div
            className="hero-bg"
            style={{ backgroundImage: bestDeal.cover_url ? `linear-gradient(90deg, rgba(10,12,16,0.9) 0%, rgba(10,12,16,0.55) 50%, rgba(10,12,16,0.2) 100%), url(${bestDeal.cover_url})` : undefined }}
          />
          <div className="hero-inner">
            <div className="hero-kicker">Meilleure promo</div>
            <h2 className="hero-title">{bestDeal.title}</h2>
            <p className="hero-sub">-{bestDeal.discount}% dès maintenant</p>
            <div className="hero-actions">
              <Link to={`/game/${bestDeal.id}`} className="hero-btn">Voir le jeu</Link>
            </div>
          </div>
        </section>
      )}

      

      {promos.length > 0 && (
        <section>
          <h2 className="section-title">En promo</h2>
          <div className="games-grid ig-grid">
            {promos.map((j) => (
              <GameCard key={`promo-${j.id}`} game={j} />
            ))}
          </div>
        </section>
      )}

   




      {recentGames.length > 0 && (
        <section className="recent">
          <h2 className="section-title">Vu récemment</h2>
          <div className="h-scroll">
            {recentGames.map((g) => (
              <div key={`recent-${g.id}`} className="card-inline">
                <GameCard game={g} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filtres rapides positionnés juste avant Tous les jeux, sous Vu récemment */}
      <section className="platforms">
        <h2 className="section-title">Filtres rapides</h2>
        <div className="chip-group">
          {[
            { key: "all", label: "Tout" },
            { key: "promo", label: "En promo" },
            { key: "no-promo", label: "Sans promo" },
            { key: "under20", label: "< 20$" },
            { key: "under40", label: "< 40$" },
            { key: "under60", label: "< 60$" },
            { key: "under80", label: "< 80$" },
            { key: "under100", label: "< 100$" },
            { key: "above100", label: "> 100$" },
          ].map((f) => (
            <button
              key={f.key}
              className={"chip" + (filterKey === f.key ? " active" : "")}
              onClick={() => setFilterKey(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <div className="sort-buttons">
          <button className={sortKey === "default" ? "active" : ""} onClick={() => setSortKey("default")}>Par défaut</button>
          <button className={sortKey === "price-asc" ? "active" : ""} onClick={() => setSortKey("price-asc")}>Prix ↑</button>
          <button className={sortKey === "price-desc" ? "active" : ""} onClick={() => setSortKey("price-desc")}>Prix ↓</button>
          <button className={sortKey === "alpha" ? "active" : ""} onClick={() => setSortKey("alpha")}>A–Z</button>
        </div>
      </div>

      <h2 className="section-title">Tous les jeux</h2>
      {loading ? (
        <div className="games-grid ig-grid skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb" />
              <div className="skeleton-line l1" />
              <div className="skeleton-line l2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="games-grid ig-grid">
          {(
            (sortedAll.length ? sortedAll : activeGames)
              .filter((j) => {
                const price = Number(j?.discounted_price || j?.price || 0);
                const disc = Number(j?.discount || 0);
                if (filterKey === "promo") return disc > 0;
                if (filterKey === "no-promo") return !(disc > 0);
                if (filterKey === "under20") return price > 0 && price < 20;
                if (filterKey === "under40") return price > 0 && price < 40;
                if (filterKey === "under60") return price > 0 && price < 60;
                if (filterKey === "under80") return price > 0 && price < 80;
                if (filterKey === "under100") return price > 0 && price < 100;
                if (filterKey === "above100") return price > 100;
                return true;
              })
          ).map((j) => (
            <GameCard key={`all-${j.id}`} game={j} />
          ))}
        </div>
      )}

      <section className="cta-discord">
        <div className="cta-content">
          <div className="cta-title">Rejoins notre Discord</div>
          <div className="cta-sub">Partage tes trouvailles, compare les deals et discute avec la commu.</div>
        </div>
        <a className="cta-button" href="#" target="_blank" rel="noreferrer">
          <span className="icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M20.222 0H3.778A3.778 3.778 0 0 0 0 3.778v16.444A3.778 3.778 0 0 0 3.778 24h13.383l-.622-2.177 1.505 1.401 1.422 1.318L24 24V3.778A3.778 3.778 0 0 0 20.222 0zM8.07 18.339c-1.233 0-2.23-1.128-2.23-2.516s.997-2.516 2.23-2.516 2.23 1.128 2.23 2.516-.997 2.516-2.23 2.516zm7.86 0c-1.233 0-2.23-1.128-2.23-2.516s.997-2.516 2.23-2.516 2.23 1.128 2.23 2.516-.997 2.516-2.23 2.516z"/>
            </svg>
          </span>
          Rejoindre
        </a>
      </section>

      <footer className="page-footer">
        <div>© {new Date().getFullYear()} Instant Gooning</div>
        <div className="footer-links">
          <Link to="/support">Support</Link>
          <a href="#">Conditions</a>
          <a href="#">Confidentialité</a>
        </div>
      </footer>
    </div>
  );
}
