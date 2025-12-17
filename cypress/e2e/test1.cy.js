import { inspect } from "util";

describe("Test register, login, refresh", () => {
  it("permet de cree un compte", () => {
    cy.visit("http://localhost:5173/register");

    cy.get('input[id="email"]').type('test@test.com');
    cy.get('input[id="username"]').type('testuser');
    cy.get('input[id="first_name"]').type('Test');
    cy.get('input[id="last_name"]').type('User');
    cy.get('input[id="password"]').type('Abcde123456!');
    cy.intercept('POST', '**/api/auth/register').as('register');
    cy.contains("S'inscrire").click();
    cy.wait('@register').its('response.statusCode').should('eq', 201);

    
    cy.get('input[id="email"]').type('test@test.com');
    cy.get('input[id="password"]').type('Abcde123456!');
    cy.intercept('POST', '**/api/auth/login').as('login');
    cy.contains('Se connecter').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
 
    cy.reload();
  });
});