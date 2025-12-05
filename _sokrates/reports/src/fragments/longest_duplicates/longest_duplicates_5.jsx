src/pages/Dev/DevGameDetail/devGameDetail.jsx [197:217]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (!url) return null;
    try {
      const u = new URL(url);
      const isYouTube =
        u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (isYouTube) {
        let idParam = "";
        if (u.hostname.includes("youtu.be")) {
          idParam = u.pathname.replace("/", "");
        } else if (u.searchParams.has("v")) {
          idParam = u.searchParams.get("v") || "";
        }
        if (idParam) {
          return `https://www.youtube.com/embed/${idParam}?rel=0&modestbranding=1&color=white`;
        }
      }

      return url;
    } catch {
      return url;
    }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [93:113]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (!url) return null;
    try {
      const u = new URL(url);
      const isYouTube =
        u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (isYouTube) {
        let idParam = "";
        if (u.hostname.includes("youtu.be")) {
          idParam = u.pathname.replace("/", "");
        } else if (u.searchParams.has("v")) {
          idParam = u.searchParams.get("v") || "";
        }
        if (idParam) {
          return `https://www.youtube.com/embed/${idParam}?rel=0&modestbranding=1&color=white`;
        }
      }

      return url;
    } catch {
      return url;
    }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



