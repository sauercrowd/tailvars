const puppeteer = require('puppeteer');
const path = require('path');

describe('Varwind Library Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(`file:${path.join(__dirname, 'test.html')}`);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Basic styles are applied correctly', async () => {
    const styles = await page.evaluate(() => {
      const element = document.getElementById('test-element');
      return window.getComputedStyle(element);
    });

    expect(styles.padding).toBe('4px');
    expect(styles.paddingLeft).toBe('8px');
    expect(styles.backgroundColor).toBe('rgb(239, 239, 239)');
  });

  test('Hover styles are applied correctly', async () => {
    await page.hover('#test-element');

    const hoverStyles = await page.evaluate(() => {
      const element = document.getElementById('test-element');
      return window.getComputedStyle(element);
    });

    expect(hoverStyles.backgroundColor).toBe('rgb(107, 114, 128)');
  });

  test('Media query styles are applied correctly', async () => {
    await page.setViewport({ width: 800, height: 600 });

    const mediaQueryStyles = await page.evaluate(() => {
      const element = document.getElementById('test-element');
      return window.getComputedStyle(element);
    });

    expect(mediaQueryStyles.paddingRight).toBe('32px');
  });
});
