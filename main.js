// node main.js --recapture

const fs = require('fs');
const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));

const shouldSkipUrl = (url, patterns) => {
    return patterns.some(pattern => url.includes(pattern));
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const captureScreenshot = async (url, width, height, folder) => {
    const screenshotPath = `${folder}/${encodeURIComponent(url)}.jpg`;

    // If the file already exists and no recapture argument is passed, skip the screenshot.
    if (!args.recapture && fs.existsSync(screenshotPath)) {
        console.log(`..... Screenshot for ${url} already exists. Skipping.`);
       return;
    }

    console.log(`Loading browser ${url} `);
    const browser = await puppeteer.launch();
    console.log(`..... loading page....`);
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    //console.log(`..... waiting 10 seconds....`);
    //await delay(10000); // Delay here
    try {
        console.log(`..... genrating screenshot ....`);

        await page.goto(url, { waitUntil: 'networkidle2' }); // 5000 milliseconds = 5 seconds
    } catch (error) {
        console.log(`..... Failed to load ${url} within 15 seconds.`);
        await browser.close();
        return;
    }

    await page.screenshot({ path: screenshotPath, type: 'jpeg' });
    console.log(`Captured screenshot for ${url}`);
    await browser.close();
};


const processCsv = async(filePath, width, height, folder, skipPatterns) => {
    const data = [];
fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
             data.push(row);
        })
        .on('end', async () => {
            console.log('CSV file processed');
            // Process each URL one by one
            for (const row of data) {
                const url = row['url'];

                // Skip if the URL contains any of the specified patterns
                if (skipPatterns.some(pattern => url.includes(pattern))) {
                    console.log(`Skipping ${url}`);
                    continue;
                }

                await captureScreenshot( url, width, height, folder);
            }
        });
};

const processJson = (filePath, width, height, folder, skipPatterns) => {
    const data = require(filePath);
    data.forEach(row => {
        const url = row.url;
        if (shouldSkipUrl(url, skipPatterns)) {
            console.log(`Skipped ${url} due to skip pattern`);
        } else {
            captureScreenshot(url, width, height, folder);
        }
    });
    console.log('JSON file processed');
};


const main = () => {
    //const filePath = 'sptPages.json'; // replace with your file path
    const filePath = 'sptPages.csv'; // replace with your file path
    const width = 1440 ;
    const height = 900;
    const folder = 'screenshots';
    const skipPatterns = ['enrollments', 'sitepagetemplates']; // replace with your patterns

    if (!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }

    processCsv(filePath, width, height, folder, skipPatterns);
    //processJson(filePath, width, height, folder, skipPatterns);
};

main();


