const q = require('./qa-browser.cjs');
const { desktopFlow, DESKTOP } = require('./qa-flows.cjs');
const { record, search, toggle, readCard, shot, RESULT, fs, path } = q;

async function activeElementInfo(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    return { tag: element?.tagName, text: element?.textContent?.trim(), boxShadow: element ? getComputedStyle(element).boxShadow : null };
  });
}

async function keyboardFlow(browser) {
  const { context, page } = await q.newPage(browser, DESKTOP);
  await page.keyboard.press('Tab');
  await page.keyboard.type('Paris');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.locator(RESULT).waitFor();
  await page.keyboard.press('Tab');
  const onToggle = await activeElementInfo(page);
  const focusShot = await shot(page, 'foco-teclado-botao-1280');
  await page.keyboard.press('Enter');
  const afterEnter = { card: await readCard(page), focus: await activeElementInfo(page) };
  await page.keyboard.press('Space');
  const afterSpace = { card: await readCard(page), focus: await activeElementInfo(page) };
  await page.keyboard.press('Escape');
  const afterEscape = await readCard(page);
  await page.keyboard.press('Tab');
  const nextFocus = await activeElementInfo(page);
  const ringVisible = Boolean(onToggle.boxShadow && onToggle.boxShadow !== 'none');
  const ok = onToggle.text?.startsWith('Mostrar em °F') && ringVisible
    && afterEnter.card.current === '65.1 °F' && afterEnter.focus.text?.startsWith('Mostrar em °C')
    && afterSpace.card.current === '18.4 °C' && afterSpace.focus.text?.startsWith('Mostrar em °F')
    && afterEscape.current === '18.4 °C' && nextFocus.text === 'Open-Meteo';
  record('QA-CA11', 'CA-11', ok, { focoAposResultado: onToggle, aposEnter: afterEnter, aposEspaco: afterSpace, aposEsc: afterEscape.current, proximoFoco: nextFocus.text, evidencia: focusShot });
  await toggle(page).click();
  const aria = await page.locator(RESULT).ariaSnapshot();
  fs.writeFileSync(path.join(q.EV, 'aria-snapshot-resultado-fahrenheit.txt'), aria);
  const live = await page.evaluate(() => {
    const section = document.querySelector('[aria-labelledby="weather-result-title"]');
    const status = section.querySelector('[role="status"]');
    const statusStyle = getComputedStyle(status);
    return { sectionAriaLive: section.getAttribute('aria-live'), statusRole: status.getAttribute('role'), statusText: status.textContent, statusVisualmenteOculto: statusStyle.position === 'absolute' && statusStyle.width === '1px' };
  });
  record('QA-CA12-regiao-live', 'CA-12', aria.includes('status: Temperaturas exibidas em Fahrenheit') && live.statusVisualmenteOculto, { ...live, evidencia: 'aria-snapshot-resultado-fahrenheit.txt' });
  const typography = await page.evaluate(() => {
    const section = document.querySelector('[aria-labelledby="weather-result-title"]');
    const sizes = [...section.querySelectorAll('*')].filter((element) => [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim()) && !element.classList.contains('sr-only'))
      .map((element) => ({ text: element.textContent.trim().slice(0, 30), size: parseFloat(getComputedStyle(element).fontSize) }));
    const toggleElement = section.querySelector('button');
    return { menorFontePx: Math.min(...sizes.map((item) => item.size)), elementosMenores: sizes.filter((item) => item.size < 14), fonteBotaoPx: parseFloat(getComputedStyle(toggleElement).fontSize), imagensSemAlt: document.querySelectorAll('img:not([alt])').length, svgsSemAriaHidden: [...document.querySelectorAll('svg')].filter((svg) => svg.getAttribute('aria-hidden') !== 'true').length };
  });
  record('QA-A11Y-tipografia-imagens', 'A11Y', typography.menorFontePx >= 12 && typography.imagensSemAlt === 0 && typography.svgsSemAriaHidden === 0, typography);
  await context.close();
}

async function viewportFlow(browser, viewport, prefix) {
  const { context, page } = await q.newPage(browser, viewport);
  const shots = [];
  if (viewport.width === 360) shots.push(await shot(page, `inicial-${prefix}`));
  await search(page, 'Paris');
  if (viewport.width === 360) shots.push(await shot(page, `sucesso-celsius-${prefix}`));
  await toggle(page).click();
  shots.push(await shot(page, `sucesso-fahrenheit-${prefix}`));
  const button = toggle(page);
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const fullyVisible = box.x >= 0 && box.x + box.width <= viewport.width;
  const ok = !overflow && fullyVisible && box.width >= 44 && box.height >= 44;
  record(`QA-CA13-${prefix}`, 'CA-13', ok, { viewport, botao: box, rolagemHorizontal: overflow, evidencias: shots });
  if (viewport.width === 360) {
    await q.runAxe(page, `sucesso-fahrenheit-${prefix} (página)`);
    await search(page, 'cidade inexistente', 'alert');
    shots.push(await shot(page, `erro-nao-encontrada-${prefix}`));
  }
  await context.close();
}

const BOUNDARY_PAIRS = [[0, -17.8], [100, 37], [-40, 22.5], [-3.2, 25], [27, -3.2]];
const BOUNDARY_EXPECTED = [['32 °F', '0 °F'], ['212 °F', '98.6 °F'], ['-40 °F', '72.5 °F'], ['26.2 °F', '77 °F'], ['80.6 °F', '26.2 °F']];

function boundaryPayload(index) {
  const [temperature, apparentTemperature] = BOUNDARY_PAIRS[index];
  return { location: { name: `Limite ${index + 1}`, admin1: null, country: 'Brasil' }, current: { temperature, apparentTemperature, condition: { code: 1, label: 'Predominantemente limpo' }, humidity: 50, windSpeed: 10 }, units: { temperature: '°C', apparentTemperature: '°C', humidity: '%', windSpeed: 'km/h' }, source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' } };
}

async function boundaryFlow(browser) {
  const { context, page } = await q.newPage(browser, DESKTOP);
  let served = 0;
  await context.route((url) => url.pathname === '/weather', async (route) => {
    const body = JSON.stringify(boundaryPayload(served));
    served += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': q.BASE }, body });
  });
  const observed = [];
  for (let index = 0; index < BOUNDARY_PAIRS.length; index += 1) {
    await search(page, `Limite ${index + 1}`);
    await page.getByRole('heading', { name: `Limite ${index + 1}, Brasil` }).waitFor();
    if (index === 0) await toggle(page).click();
    const card = await readCard(page);
    observed.push({ celsius: BOUNDARY_PAIRS[index], esperado: BOUNDARY_EXPECTED[index], exibido: [card.current, card.apparent] });
    if (index === 0) observed[0].evidencia = await shot(page, 'limite-menos-17-8-exibe-0-fahrenheit-1280');
  }
  const noNegativeZero = !(await page.evaluate(() => document.body.innerText.includes('-0 °')));
  const ok = observed.every((item) => item.exibido[0] === item.esperado[0] && item.exibido[1] === item.esperado[1]) && noNegativeZero;
  record('QA-CA03', 'CA-03', ok, { observado: observed, semMenosZero: noNegativeZero });
  await context.close();
}

async function main() {
  fs.mkdirSync(q.SHOTS, { recursive: true });
  const browser = await q.chromium.launch();
  try {
    await desktopFlow(browser);
    await keyboardFlow(browser);
    await viewportFlow(browser, { width: 360, height: 800 }, '360');
    await viewportFlow(browser, { width: 768, height: 1024 }, '768');
    await viewportFlow(browser, { width: 1024, height: 768 }, '1024');
    await boundaryFlow(browser);
  } finally {
    await browser.close();
  }
  const report = { executadoEm: new Date().toISOString(), base: q.BASE, resultados: q.results, axe: q.axeRuns, console: q.consoleMessages, errosDePagina: q.pageErrors };
  fs.writeFileSync(path.join(q.EV, 'qa-navegador-resultados.json'), JSON.stringify(report, null, 2));
  for (const item of q.results) console.log(`${item.status.padEnd(7)} ${item.ca.padEnd(6)} ${item.id}`);
  console.log('axe:', JSON.stringify(q.axeRuns.map((run) => ({ label: run.label, passes: run.passes, violations: run.violations, incomplete: run.incomplete }))));
  console.log('console:', JSON.stringify(q.consoleMessages), 'pageErrors:', JSON.stringify(q.pageErrors));
}

main().catch((error) => {
  console.error('QA script falhou:', error);
  process.exitCode = 1;
});
