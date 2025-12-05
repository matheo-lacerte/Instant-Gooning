cypress/e2e/test2.cy.js [7:12]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    cy.visit("http://localhost:5173/login");
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('Abcde123456!');
    cy.intercept('POST', 'http://localhost:5174/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



cypress/e2e/test3.cy.js [6:11]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    cy.visit("http://localhost:5173/login");
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('Abcde123456!');
    cy.intercept('POST', 'http://localhost:5174/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



