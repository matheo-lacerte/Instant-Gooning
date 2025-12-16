import { Then } from '@cucumber/cucumber';

Then('je vois le message d\'erreur {string}', async function (message) {
  await this.page.waitForSelector(`text=${message}`);
});
