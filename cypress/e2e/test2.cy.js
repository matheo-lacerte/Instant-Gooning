// Parcours critique: recherche -> détail -> ajout panier -> payer via Stripe Checkout

describe("Parcours recherche + ajout panier (sans paiement)", () => {
  it("ajoute un article au panier et s'arrête sur le panier", () => {
    // LOGIN
    // Utilise l'URL complète pour éviter l'erreur 404 quand baseUrl n'est pas configuré
    cy.visit("http://localhost:5173/login");
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('Abcde123456!');
    cy.intercept('POST', '**/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);

    // RECHERCHE + DÉTAIL
    cy.get('input[placeholder="Rechercher un jeu..."]').type("Lost Lore");
    cy.contains("Lost Lore").click();

    // AJOUT PANIER
    cy.intercept('POST', '**/api/payments/cart/items').as('addToCart');
    cy.contains("Ajouter au panier").click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 201);

    cy.visit('http://localhost:5173/cart');
    cy.contains('Lost Lore').should('exist');

    // S'arrêter ici sur la page panier (pas de Stripe en E2E)
    cy.url().should('include', '/cart');
  });
});
