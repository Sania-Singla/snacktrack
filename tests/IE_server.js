import { Builder, Browser } from 'selenium-webdriver';

(async function () {
    let driver = await new Builder()
        .forBrowser(Browser.INTERNET_EXPLORER)
        .build();

    await driver.get('https://www.google.com');

    await driver.quit();
})();
