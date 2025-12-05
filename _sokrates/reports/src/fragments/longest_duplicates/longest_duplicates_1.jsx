src/pages/Dev/DevGameDetail/devGameDetail.jsx [263:313]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    } else {
      navigate("/login");
    }
  };

  const rating10 = useMemo(() => {
    const r = game?.rating;
    const n = r == null ? 0 : Number(r);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(10, n));
  }, [game]);

  // Save recently viewed ids in localStorage for Home page
  useEffect(() => {
    if (!game?.id) return;
    try {
      const raw = localStorage.getItem("ig_recent");
      const arr = raw ? JSON.parse(raw) : [];
      const idNum = game.id;
      const next = [idNum, ...arr.filter((x) => x !== idNum)].slice(0, 10);
      localStorage.setItem("ig_recent", JSON.stringify(next));
    } catch {}
  }, [game?.id]);

  if (loading) {
    return (
      <div className="game-detail-wrap">
        <BackLinkHome />
        <div className="skeleton-hero">
          <div className="skeleton-cover" />
          <div className="skeleton-meta">
            <div className="s1" />
            <div className="s2" />
            <div className="s3" />
          </div>
        </div>
      </div>
    );
  }

  if (!game || error) {
    return (
      <div className="game-detail-wrap">
        <p>{error ? `Erreur: ${error}` : "Jeu introuvable."}</p>
        <BackLinkHome />
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [134:184]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    } else {
      navigate("/login");
    }
  };

  const rating10 = useMemo(() => {
    const r = game?.rating;
    const n = r == null ? 0 : Number(r);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(10, n));
  }, [game]);

  // Save recently viewed ids in localStorage for Home page
  useEffect(() => {
    if (!game?.id) return;
    try {
      const raw = localStorage.getItem("ig_recent");
      const arr = raw ? JSON.parse(raw) : [];
      const idNum = game.id;
      const next = [idNum, ...arr.filter((x) => x !== idNum)].slice(0, 10);
      localStorage.setItem("ig_recent", JSON.stringify(next));
    } catch {}
  }, [game?.id]);

  if (loading) {
    return (
      <div className="game-detail-wrap">
        <BackLinkHome />
        <div className="skeleton-hero">
          <div className="skeleton-cover" />
          <div className="skeleton-meta">
            <div className="s1" />
            <div className="s2" />
            <div className="s3" />
          </div>
        </div>
      </div>
    );
  }

  if (!game || error) {
    return (
      <div className="game-detail-wrap">
        <p>{error ? `Erreur: ${error}` : "Jeu introuvable."}</p>
        <BackLinkHome />
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



