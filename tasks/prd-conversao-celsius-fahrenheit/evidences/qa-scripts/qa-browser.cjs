const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = '/Users/mrcll/ai-curso-atualizado/formacao-inteligencia-artificial/spec-driven-development/template';
const requireE2E = createRequire(path.join(ROOT, 'e2e/package.json'));
const { chromium } = requireE2E('@playwright/test');
const axeModule = requireE2E('@axe-core/playwright');
const AxeBuilder = axeModule.default ?? axeModule;

const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5111';
const EV = path.join(ROOT, 'tasks/prd-conversao-celsius-fahrenheit/evidences');
const SHOTS = path.join(EV, 'screenshots');
const RESULT = '[aria-labelledby="weather-result-title"]';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PARIS = 'Paris, Île-de-France, França';

const results = [];
const consoleMessages = [];
const pageErrors = [];
const axeRuns = [];
let weatherRequests = 0;

function record(id, ca, ok, details) {
  results.push({ id, ca, status: ok ? 'PASSOU' : 'FALHOU', details });
}

async function newPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes('/weather?')) weatherRequests += 1;
  });
  await page.goto(BASE);
  return { context, page };
}

async function search(page, city, waitFor = 'result') {
  await page.getByRole('textbox', { name: 'Cidade' }).fill(city);
  const response = page.waitForResponse((r) => r.url().includes('/weather?'));
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await response;
  if (waitFor === 'result') await page.locator(RESULT).waitFor();
  if (waitFor === 'alert') await page.getByRole('alert').waitFor();
}

function toggle(page) {
  return page.getByRole('button', { name: /^Mostrar em °/ });
}

async function readCard(page) {
  return page.evaluate(() => {
    const all = [...document.querySelectorAll('span, dt')];
    const byText = (text) => all.find((element) => element.textContent?.trim() === text);
    const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.startsWith('Mostrar em'));
    const visibleLabel = button ? [...button.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join('').trim() : null;
    return {
      current: byText('Temperatura atual')?.previousElementSibling?.textContent ?? null,
      apparent: byText('Sensação térmica')?.nextElementSibling?.textContent ?? null,
      humidity: byText('Umidade relativa')?.nextElementSibling?.textContent ?? null,
      wind: byText('Velocidade do vento')?.nextElementSibling?.textContent ?? null,
      heading: document.getElementById('weather-result-title')?.textContent ?? null,
      condition: document.querySelector('[aria-labelledby="weather-result-title"] > p')?.textContent ?? null,
      sourceLink: document.querySelector('[aria-labelledby="weather-result-title"] a')?.getAttribute('href') ?? null,
      toggleLabel: visibleLabel,
      status: document.querySelector('[aria-labelledby="weather-result-title"] [role="status"]')?.textContent ?? null,
    };
  });
}

async function layoutBoxes(page) {
  return page.evaluate(() => {
    const box = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null;
    };
    const section = document.querySelector('[aria-labelledby="weather-result-title"]');
    return {
      section: box(section),
      heading: box(document.getElementById('weather-result-title')),
      condition: box(section?.querySelector(':scope > p')),
      metrics: box(section?.querySelector('dl')),
      toggle: box(section?.querySelector('button')),
    };
  });
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
  return `screenshots/${name}.png`;
}

async function runAxe(page, label, include) {
  let builder = new AxeBuilder({ page }).withTags(WCAG);
  if (include) builder = builder.include(include);
  const analysis = await builder.analyze();
  const violations = analysis.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  axeRuns.push({ label, passes: analysis.passes.length, incomplete: analysis.incomplete.map((v) => v.id), violations });
  return violations;
}

async function measureToggle(page) {
  return page.locator(RESULT).evaluate((section) => new Promise((resolve) => {
    const label = [...section.querySelectorAll('span')].find((element) => element.textContent === 'Temperatura atual');
    const value = label.previousElementSibling;
    const button = section.querySelector('button');
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve(performance.now() - start);
    });
    observer.observe(value, { characterData: true, childList: true, subtree: true });
    const start = performance.now();
    button.click();
  }));
}

module.exports = { BASE, EV, SHOTS, RESULT, PARIS, results, consoleMessages, pageErrors, axeRuns, record, newPage, search, toggle, readCard, layoutBoxes, shot, runAxe, measureToggle, chromium, getWeatherRequests: () => weatherRequests, fs, path };
