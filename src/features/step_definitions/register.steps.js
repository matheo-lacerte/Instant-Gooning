import { Given, When, Then } from '@cucumber/cucumber';

Given("je suis sur la page d'inscription", async function () {
  await this.page.goto('http://localhost:5173/register');
});

// Test d'inscription avec des identifiants valides
When('je saisis des nouvelles données', async function () {
    await this.page.fill('#email', 'test@example.com');
    await this.page.fill('#username', 'UserTestExample');
    await this.page.fill('#first_name', 'Test');
    await this.page.fill('#last_name', 'Example');
    await this.page.fill('#password', 'SuperPassword123!');
});

When("je valide le formulaire d'inscription", async function () {
  await this.page.click("text=S'inscrire");
});

Then('je suis inscrit', async function () {
  await this.page.waitForURL('**/login');
});

// Test d'inscription avec un email déjà existant
When('je saisis un email existant', async function () {
    await this.page.fill('#email', 'test@example.com');
    await this.page.fill('#username', 'NewUserTestExample');
    await this.page.fill('#first_name', 'NewTest');
    await this.page.fill('#last_name', 'Example');
    await this.page.fill('#password', 'SuperPassword123!');
});