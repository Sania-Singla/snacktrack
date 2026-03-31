import { Browser, Builder, By, until } from 'selenium-webdriver';

(async function seleniumOperationsDemo() {
    // Open browser
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    console.log('Chrome launched');

    try {
        
        await driver.get('https://kiosk.snacktrack.live');
        console.log('Website opened successfully');

        let title = await driver.getTitle();
        console.log('Page Title:', title);

        let currentUrl = await driver.getCurrentUrl();
        console.log('Current URL:', currentUrl);

        // 4️⃣ findElement() – Locate Element
        let verifyBtn = await driver.wait(
            until.elementLocated(By.id('verifyKitchenKeyBtn')),
            2000
        );
        console.log('Verify button located');

        // 5️⃣ isDisplayed() – Visibility Check
        let isDisplayed = await verifyBtn.isDisplayed();
        console.log('Verify button displayed:', isDisplayed);

        // 6️⃣ isEnabled() – Enabled Check
        let isEnabled = await verifyBtn.isEnabled();
        console.log('Verify button enabled:', isEnabled);

        // 7️⃣ Explicit Wait – until.elementLocated()
        let hostelDropdown = await driver.wait(
            until.elementLocated(By.id('hostelDropdown')),
            2000
        );
        console.log('Hostel dropdown located');

        // 8️⃣ click() – Click Action
        await hostelDropdown.click();
        console.log('Clicked hostel dropdown');

        // Select GH9 hostel using XPath
        let hostelOption = await driver.wait(
            until.elementLocated(By.xpath("//span[contains(text(),'GH9')]")),
            2000
        );

        await hostelOption.click();
        console.log('Selected GH9 Hostel');

        // 9️⃣ sendKeys() – Enter Text
        let kitchenKeyInput = await driver.wait(
            until.elementLocated(By.id('kitchenKeyInput')),
            2000
        );

        await kitchenKeyInput.sendKeys('gh9@snacks');
        console.log('Entered Kitchen Key');

        // Re-check enabled state
        isEnabled = await verifyBtn.isEnabled();
        console.log('Verify button enabled after input:', isEnabled);

        // 🔟 click() – Click Verify
        await verifyBtn.click();
        console.log('Clicked Verify button');

        // 1️⃣1️⃣ Search using sendKeys()
        let searchInput = await driver.wait(
            until.elementLocated(By.id('searchInput')),
            2000
        );

        await searchInput.sendKeys('cold');
        console.log('Entered search term: cold');

        // 1️⃣2️⃣ navigate().refresh()
        await driver.navigate().refresh();
        console.log('Page refreshed');

        // 1️⃣3️⃣ navigate().back()
        await driver.navigate().back();
        console.log('Navigated back');

        // 1️⃣4️⃣ navigate().forward()
        await driver.navigate().forward();
        console.log('Navigated forward');
    } catch (err) {
        console.error('Error during test execution:', err);
    } finally {
        // 1️⃣5️⃣ quit() – Close Browser
        await driver.quit();
        console.log('Browser closed');
    }
})();
