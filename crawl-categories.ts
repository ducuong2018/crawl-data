import api from './api';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ObjectsToCsv from 'objects-to-csv';
puppeteer.use(StealthPlugin())
export interface ICategoreis {
    name: string | undefined | null
    image: string | undefined | null
    parentsName: string | undefined | null
    level: number | null
}
const main = async () => {
    const categoriesLv1: ICategoreis[] = await getCategoryLv1();
    for (let i = 0; i < categoriesLv1.length; i++) {
        await getCategoryLv2(nonAccentVietnamese(categoriesLv1[i].name));
    }
}
const getCategoryLv1 = async () => {
    const { status, body } = await api('https://www.pharmacity.vn/');
    const $ = cheerio.load(body.replace(/(\r\n|\n|\r|\t)/gm, ''), {
        decodeEntities: false,
    });
    const categoriesLv1: ICategoreis[] = []
    $('.CategoryList_category-item__1MvGF').map((index, element) => {
        categoriesLv1.push({
            name: $(element).find('p').text(),
            image: $(element).find('img').attr('src'),
            parentsName: '',
            level: 1
        });
    })
    const csvFile = new ObjectsToCsv(categoriesLv1)
    await csvFile.toDisk(`./assets/category.csv`, {
        bom: true,
        append: true
    })
    return categoriesLv1;
}
const getCategoryLv2 = async (url: string) => {
    puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    })
        .then(async (browser) => {
            const page = await browser.newPage()
            await page.setViewport({
                width: 1366,
                height: 1200,
                deviceScaleFactor: 1,
            });
            await page.goto(`https://www.pharmacity.vn/${url}`);
            const categories = await page.evaluate(() => {
                const data = [...document.querySelectorAll('.CategoryAside_list-item__OxrcK')];
                const exportData: ICategoreis[] = []
                data.forEach((element) => {
                    exportData.push({
                        name: element.querySelector('.CategoryAside_list-box__PX3GQ > h3')?.textContent,
                        image: element.querySelector('.CategoryAside_list-box__PX3GQ > figure > img')?.getAttribute('src'),
                        parentsName: '',
                        level: 2
                    });
                    const categoryLv3 = element.querySelectorAll('.ReactCollapse--collapse > .ReactCollapse--content > .CategoryAside_cat-box__3dX4j > .CategoryAside_cat-item__2spUX');
                    categoryLv3.forEach((item) => {
                        exportData.push({
                            name: item.querySelector('h3')?.textContent,
                            image: null,
                            parentsName: element.querySelector('.CategoryAside_list-box__PX3GQ > h3')?.textContent,
                            level: 3
                        })
                    })

                });
                return exportData;
            });
            const value = categories.map((item) => {
                if (item.level === 2) {
                    item.parentsName = url;
                }
                if (item.level === 3) {
                    item.parentsName = nonAccentVietnamese(item.parentsName);
                }
                return item;
            });
            const csvFile = new ObjectsToCsv(value);
            await csvFile.toDisk(`./assets/category.csv`, {
                bom: true,
                append: true
            });

            return await browser.close();
        });
}
export function nonAccentVietnamese(str?: string | null) {
    if (str) {
        str = str.toLowerCase();
        //     We can also use this instead of from line 11 to line 17
        //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
        //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
        //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
        //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
        //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
        //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
        //     str = str.replace(/\u0111/g, "d");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

        str = str.trim().replace(/ /g, "-");
        return str;
    }
    return ''

}
main();