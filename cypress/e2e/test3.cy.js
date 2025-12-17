// Parcours critique: édition du profil utilisateur (persistance et reflet UI)

describe("Profil: modifier informations et persistance", () => {
  it("se connecte, modifie le prénom et sauvegarde", () => {
    // LOGIN
    cy.visit("http://localhost:5173/login");
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('Abcde123456!');
    cy.intercept('POST', '**/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);

    // Aller au profil
    cy.visit('http://localhost:5173/profile');
    cy.contains('Informations du compte').should('be.visible');

    // Aller à la page d'édition
    cy.contains('Modifier les informations du compte').click();
    cy.url().should('include', '/profile?edit=profile');

    // Modifier le prénom
    const newFirst = `Test-${Date.now()}`;
    cy.get('#firstName').clear().type(newFirst);

    // Sauvegarder
    cy.intercept('POST', '**/api/user/changeUserProfile').as('saveProfile');
    cy.contains('Sauvegarder').click();
    cy.wait('@saveProfile').its('response.statusCode').should('eq', 200);

    cy.reload();

    // Retour profil et vérifications
    cy.url().should('include', '/profile');
    cy.get('#firstName').should('have.value', newFirst);

    // Vérifier localStorage persiste
    cy.window().then(win => {
      const userRaw = win.localStorage.getItem('user');
      expect(userRaw).to.be.a('string');
      const user = JSON.parse(userRaw);
      expect(user.first_name).to.eq(newFirst);
    });
  });
});
