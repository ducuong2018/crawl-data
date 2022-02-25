import puppeteer  from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
const main = () =>{
    puppeteer.launch({
        headless:true,
        args: ['--no-sandbox'],
    })
    .then(async(browser) => {
        const page = await browser.newPage();
        await page.waitForTimeout(1000)
        await page.goto('https://www.pharmacity.vn/');
        // await page.screenshot({ path: 'fullpage.png', fullPage: true });
        const categories = await page.evaluate(() =>{
            const listCategory = document.querySelectorAll('.CategoryList_category-item__1MvGF');
            console.log(listCategory);
            
        });
        return await browser.close();
    })
    
}
main();