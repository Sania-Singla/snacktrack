import { Browser, Builder, By, until } from 'selenium-webdriver';

class GooglePage {
    constructor(driver) {
        this.driver = driver;
    }

    async load() {
        await this.driver.get('https://www.google.com');
    }

    async isLoaded() {
        await this.driver.wait(until.elementLocated(By.name('q')), 5000);
    }

    async search(text) {
        let searchBox = await this.driver.findElement(By.name('q'));
        await searchBox.sendKeys(text);
        await searchBox.submit();
    }
}

(async function test() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    let page = new GooglePage(driver);

    await page.load();
    await page.isLoaded();
    await page.search('Selenium');

    await driver.quit();
})();


