const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SLIDES_DIR = path.join(__dirname, 'ppt_assets', 'slides_v2');
const RENDERS_DIR = path.join(__dirname, 'ppt_assets', 'renders');

const SLIDES = [
  { html: 'title.html', out: 'slide_title.png', w: 1920, h: 1080 },
  { html: 'solution.html', out: 'slide_solution.png', w: 1920, h: 1080 },
  { html: 'architecture.html', out: 'slide_architecture.png', w: 1920, h: 1080 },
  { html: 'techstack.html', out: 'slide_techstack.png', w: 1920, h: 1080 },
  { html: 'feasibility.html', out: 'slide_feasibility.png', w: 1920, h: 1080 },
  { html: 'impact.html', out: 'slide_impact.png', w: 1920, h: 1080 },
  { html: 'references.html', out: 'slide_references.png', w: 1920, h: 1080 },
];

async function renderAll() {
  if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR, { recursive: true });

  console.log('Launching Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  for (const slide of SLIDES) {
    const htmlPath = path.join(SLIDES_DIR, slide.html);
    const outPath = path.join(RENDERS_DIR, slide.out);

    if (!fs.existsSync(htmlPath)) {
      console.log(`  SKIP: ${slide.html} not found`);
      continue;
    }

    const page = await context.newPage();
    await page.setViewportSize({ width: slide.w, height: slide.h });

    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: slide.w, height: slide.h },
      type: 'png',
    });

    console.log(`  RENDERED: ${slide.out}`);
    await page.close();
  }

  await browser.close();
  console.log(`\nAll ${SLIDES.length} slides rendered to ${RENDERS_DIR}`);
}

renderAll().catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});
