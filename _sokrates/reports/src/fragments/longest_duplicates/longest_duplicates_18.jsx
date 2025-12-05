src/pages/Dev/DevGameDetail/devGameDetail.jsx [58:71]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      } catch (err) {
        if (!ignore) setError(err?.message || "Erreur inattendue");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const genres = useMemo(() => {
    if (!game) return [];
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [26:39]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      } catch (err) {
        if (!ignore) setError(err?.message || "Erreur inattendue");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const genres = useMemo(() => {
    if (!game) return [];
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



