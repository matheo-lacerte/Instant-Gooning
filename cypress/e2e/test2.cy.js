import { inspect } from "util";

describe("Parcours recherche + ajout panier critique", () => {
  it("recherche jeu, click sur le jeu, ajout au panier", () => {
    cy.visit("http://localhost:5173/login");
    cy.get('input[id="email"]').type('test@test.com');
    cy.get('input[id="password"]').type('Abcde123456!');
    cy.intercept('POST', 'http://localhost:5174/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);


    cy.get('input[placeholder="Rechercher un jeu..."]').type("Lost Lore");
    cy.contains("Lost Lore").click();

    cy.intercept('POST', 'http://localhost:5174/api/payments/cart/items').as('addToCart');
    cy.contains("Ajouter au panier").click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 201);

    cy.visit("http://localhost:5173/cart");
    cy.contains("Lost Lore").should('exist');
  });
});
