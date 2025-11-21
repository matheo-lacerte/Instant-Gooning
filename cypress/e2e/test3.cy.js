describe("Visite de l'app", () => {
  it("ouvre la page d'accueil", () => {
    cy.visit("http://localhost:5173"); // ton projet Vite
  });
});
