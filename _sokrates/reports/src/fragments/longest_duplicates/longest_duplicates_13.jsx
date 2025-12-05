src/pages/Dev/DevGameDetail/devGameDetail.jsx [69:80]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5174/api/games/GetGameById/${id}`,
          { method: "GET" }
        );
        if (!response.ok) throw new Error("Réponse invalide du serveur");
        const data = await response.json();
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [33:44]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5174/api/games/GetGameById/${id}`,
          { method: "GET" }
        );
        if (!response.ok) throw new Error("Réponse invalide du serveur");
        const data = await response.json();
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



