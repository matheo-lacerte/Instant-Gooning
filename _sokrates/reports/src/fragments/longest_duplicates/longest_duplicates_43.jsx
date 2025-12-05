src/pages/Dev/DevGameDetail/devGameDetail.jsx [101:108]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const formatPrice = (value) => {
    if (value == null) return "";
    const cents = Number(value);
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [62:69]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const formatPrice = (value) => {
    if (value == null) return "";
    const cents = Number(value);
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



