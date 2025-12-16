import { Given, When, Then } from '@cucumber/cucumber';

Given('je suis sur la page de connexion', async function () {
  await this.page.goto('http://localhost:5173/login');
});

// Test de connexion avec des identifiants valides
When('je saisis un email valide et un mot de passe valide', async function () {
  await this.page.fill('#email', 'test@example.com');
  await this.page.fill('#password', 'SuperPassword123!');
});

When('je valide le formulaire de connexion', async function () {
  await this.page.click('text=Se connecter');
});

Then('je suis connecté', async function () {
  await this.page.waitForURL('**/');
});

// Test de connexion avec des identifiants invalides
When('je saisis un email invalide et un mot de passe invalide', async function () {
  await this.page.fill('#email', 'test@exampl');
  await this.page.fill('#password', 'wrongpassword');
});