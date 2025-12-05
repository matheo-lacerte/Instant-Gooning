src/pages/Dev/DevGameDetail/devGameDetail.jsx [30:41]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/games/GetGameById/${id}`,
          { method: "GET" }
        );
        if (!response.ok) throw new Error("Réponse invalide du serveur");
        const data = await response.json();
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [13:24]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/games/GetGameById/${id}`,
          { method: "GET" }
        );
        if (!response.ok) throw new Error("Réponse invalide du serveur");
        const data = await response.json();
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



