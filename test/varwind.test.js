const puppeteer = require('puppeteer');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

// copy varwind.js from root to this folder
const fs = require('fs');
fs.copyFileSync(path.join(__dirname, '../varwind.js'), path.join(__dirname, 'varwind.js'));


describe('Varwind Library Tests', () => {
  let browser;
  let page;
  let server;
  let port;

  beforeAll(async () => {

    //server = spawn('npx', ['http-server', '-p', '8080', '.'], { shell: true });
      server = spawn('python', ['-m', 'http-server'], {shell: true});

      port = 8000;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    //// Extract the port from the server output
    //await new Promise((resolve) => {
    //  server.stdout.on('data', (data) => {
    //    const match = data.toString().match(/Available on:\s+http:\/\/127\.0\.0\.1:(\d+)/);
    //    if (match) {
    //      port = match[1];
    //      resolve();
    //    }
    //  });
    //});


    await waitOn({ resources: [`http://localhost:${port}`] });

    browser =  await puppeteer.launch({
        args: process.env.DISABLE_SANDBOX ? ['--no-sandbox', '--disable-setuid-sandbox'] : undefined,
    });

      page = await browser.newPage({viewport: {width: 600, height: 600}});
      await page.goto(`http://localhost:${port}/test.html`);
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  const getEffectiveStyle = async (selector, property) => {
    return page.evaluate((selector, property) => {
      const element = document.querySelector(selector);
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.getPropertyValue(property).trim();
    }, selector, property);
  };

  test('Basic styles are applied correctly', async () => {
    // Wait for any potential hover effect to be applied
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(await getEffectiveStyle('#test-element', 'padding')).toBe('4px 32px 4px 8px');
    expect(await getEffectiveStyle('#test-element', 'padding-left')).toBe('8px');
    expect(await getEffectiveStyle('#test-element', 'background-color')).toBe('rgb(239, 239, 239)');
  });

  test('Hover styles are applied correctly', async () => {
    await page.hover('#test-element');

    // Wait for any potential hover effect to be applied
    await new Promise((resolve) => setTimeout(resolve, 100))

    const hoverBgColor = await getEffectiveStyle('#test-element', 'background-color');
    expect(hoverBgColor).toBe('rgb(107, 114, 128)');
  });

  test('Media query styles are applied correctly', async () => {
    await page.setViewport({ width: 800, height: 600 });

    // Wait for any potential media query styles to be applied
    await new Promise((resolve) => setTimeout(resolve, 100))

    const paddingRight = await getEffectiveStyle('#test-element', 'padding-right');
    expect(paddingRight).toBe('32px');
  });
});
