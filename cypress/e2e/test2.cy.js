// Parcours critique: recherche -> détail -> ajout panier -> payer via Stripe Checkout

describe("Parcours recherche + ajout panier + paiement", () => {
  it("ajoute au panier puis paie avec carte test Stripe", () => {
    // LOGIN
    // Utilise l'URL complète pour éviter l'erreur 404 quand baseUrl n'est pas configuré
    cy.visit("http://localhost:5173/login");
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('Abcde123456!');
    cy.intercept('POST', 'http://localhost:5174/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);

    // RECHERCHE + DÉTAIL
    cy.get('input[placeholder="Rechercher un jeu..."]').type("Lost Lore");
    cy.contains("Lost Lore").click();

    // AJOUT PANIER
    cy.intercept('POST', 'http://localhost:5174/api/payments/cart/items').as('addToCart');
    cy.contains("Ajouter au panier").click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 201);

    cy.visit('http://localhost:5173/cart');
    cy.contains('Lost Lore').should('exist');

    // DÉMARRER CHECKOUT (Stripe Checkout) — route réelle côté serveur
    cy.intercept('POST', 'http://localhost:5174/api/payments/cart/checkout').as('createCheckout');
    cy.contains('Payer').click();
    cy.wait('@createCheckout', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // L'app devrait rediriger vers stripe.com/checkout
    cy.url({ timeout: 20000 }).should('include', 'checkout.stripe.com');

    // Interagir avec Stripe Checkout (cross-origin) — attendre que le contenu soit prêt
    cy.origin('https://checkout.stripe.com', () => {
      // Attendre que le DOM soit prêt et que le skeleton soit remplacé
      cy.document().its('readyState').should('eq', 'complete');
      cy.get('body', { timeout: 20000 }).should('exist');

      // Certaines pages de Checkout n'ont pas le champ email (déduit via session), on ne l'exige pas

      // Les champs carte sont dans des iframes; cibler via data-elements ou place-holders
      // Numéro de carte
      cy.get('iframe', { timeout: 20000 }).its('length').should('be.greaterThan', 0);
      cy.get('iframe', { timeout: 20000 }).then(($iframes) => {
        // Cherche l'iframe qui contient le numéro de carte
        const cardNumberIframe = Array.from($iframes).find(f => f.name?.includes('cardNumber') || f.title?.includes('Secure card number input')) || $iframes[0];
        const expIframe = Array.from($iframes).find(f => f.name?.includes('cardExpiry') || f.title?.includes('Secure expiration date input')) || $iframes[1];
        const cvcIframe = Array.from($iframes).find(f => f.name?.includes('cardCvc') || f.title?.includes('Secure CVC input')) || $iframes[2];

        cy.wrap(cardNumberIframe).its('contentDocument.body', { timeout: 20000 }).should('not.be.empty')
          .then(cy.wrap)
          .find('input[name="number"], input[placeholder="1234 1234 1234 1234"], input')
          .type('4242424242424242');

        cy.wrap(expIframe).its('contentDocument.body', { timeout: 20000 }).should('not.be.empty')
          .then(cy.wrap)
          .find('input[name="expiry"], input[placeholder="MM / YY"], input')
          .type('1228');

        cy.wrap(cvcIframe).its('contentDocument.body', { timeout: 20000 }).should('not.be.empty')
          .then(cy.wrap)
          .find('input[name="cvc"], input[placeholder="CVC"], input')
          .type('123');
      });

      // Nom du titulaire si requis
      cy.get('input[name="name"], input[placeholder="Name on card"], input', { timeout: 20000 })
        .first().type('Test Buyer', { force: true });

      // Bouton payer
      cy.contains('Pay', { timeout: 20000 }).click();
    });

    // Après paiement réussi, Stripe redirige vers la success URL de l'app
    cy.url({ timeout: 30000 }).should('include', '/purchase/success');
    cy.contains('Merci').should('exist'); // ajuste selon ton UI
  });
});
