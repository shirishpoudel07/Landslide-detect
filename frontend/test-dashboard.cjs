const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const executablePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  let browser;
  for (const path of executablePaths) {
    if (fs.existsSync(path)) {
      try {
        console.log('Found executable:', path);
        browser = await puppeteer.launch({ executablePath: path, headless: "new" });
        break;
      } catch (e) {
        console.log('Failed to launch with', path, e.message);
      }
    }
  }

  if (!browser) {
    console.error('Could not find or launch any suitable browser executable.');
    process.exit(1);
  }

  try {
    const page = await browser.newPage();
    
    // Set viewport for a good screenshot
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Waiting for the map container to render...');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    
    // Give it an extra 3 seconds for tiles and risk zones to render properly
    await new Promise(r => setTimeout(r, 3000));

    console.log('Taking initial dashboard screenshot...');
    await page.screenshot({ path: 'test_dashboard.png' });
    console.log('Saved test_dashboard.png');

    console.log('Interacting with the language toggle (switching to Hindi)...');
    await page.select('.language-toggle select', 'hi');
    await new Promise(r => setTimeout(r, 1500)); // wait for translation

    console.log('Interacting with the report incident form...');
    // We can't guarantee the translated placeholder text easily here, so we select by generic element types
    await page.type('.report-form textarea', 'Automated testing incident description via Puppeteer');
    await page.select('.report-form select', 'High');

    console.log('Taking interaction screenshot...');
    await page.screenshot({ path: 'test_interaction.png' });
    console.log('Saved test_interaction.png');

  } catch (error) {
    console.error('An error occurred during testing:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
    console.log('Test completed.');
  }
})();
