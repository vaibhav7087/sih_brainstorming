const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });

  const mockups = [
    { file: 'architecture_diagram.html', name: 'architecture', width: 1200, height: 800 },
    { file: 'userflow_diagram.html', name: 'userflow', width: 1400, height: 550 },
    { file: 'ml_engine_diagram.html', name: 'ml_engine', width: 1200, height: 500 },
    { file: 'login.html', name: 'login', width: 800, height: 600 },
    { file: 'mp_dashboard.html', name: 'mp_dashboard', width: 1280, height: 720 },
    { file: 'da_cag_dashboard.html', name: 'da_cag_dashboard', width: 1280, height: 720 },
    { file: 'ministry_dashboard.html', name: 'ministry_dashboard', width: 1280, height: 720 },
  ];

  const baseDir = path.join(__dirname, 'ppt_assets', 'mockups');
  const outDir = path.join(__dirname, 'ppt_assets', 'screenshots');

  for (const m of mockups) {
    const page = await browser.newPage({ viewport: { width: m.width, height: m.height } });
    await page.goto('file:///' + path.join(baseDir, m.file).replace(/\\/g, '/'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, m.name + '.png'), fullPage: false });
    console.log('Screenshot: ' + m.name + '.png');
    await page.close();
  }

  await browser.close();
  console.log('Done');
})();
