src/pages/Dev/DevGameDetail/devGameDetail.jsx [97:110]:
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



src/pages/GameDetail/GameDetail.jsx [46:59]:
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



