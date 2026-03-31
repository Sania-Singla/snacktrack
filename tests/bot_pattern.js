import { Browser, Builder, By, Key } from 'selenium-webdriver';

class GoogleBot {
    constructor(driver) {
        this.driver = driver;
    }

    async openSite() {
        await this.driver.get('https://www.google.com');
    }

    async search(text) {
        let box = await this.driver.findElement(By.name('q'));
        await box.sendKeys(text, Key.RETURN);
    }
}

(async function run() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    let bot = new GoogleBot(driver);

    await bot.openSite();
    await bot.search('Automation Testing');

    await driver.quit();
})();


