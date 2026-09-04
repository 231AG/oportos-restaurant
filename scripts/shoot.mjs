/**
 * Visual verification driver.
 *
 * There is no browser-automation MCP server available in this environment, but
 * Chromium ships with the image, so this script does the same job: it drives a
 * real browser against the running dev server — scrolling, moving the pointer,
 * clicking, resizing — and writes PNGs to /screenshots.
 *
 * WebGL runs through SwiftShader in headless Chromium, so the captures show the
 * actual 3D scene rather than an empty canvas.
 *
 *   node scripts/shoot.mjs [baseUrl] [--only=name,name]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2]?.startsWith("http")
  ? process.argv[2]
  : "http://127.0.0.1:3000";
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.split("=")[1].split(",") : null;

const OUT = path.resolve("screenshots");
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(page, ms = 1200) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await wait(ms);
}

/**
 * Scrolls with real wheel events rather than `window.scrollTo`.
 *
 * Lenis owns the scroll position on non-touch devices and re-applies its own
 * target every frame, so a programmatic `scrollTo` is silently undone — which
 * is exactly why the first run of this script captured the hero seven times.
 * Wheel events go through Lenis the same way a user's would.
 */
async function scrollTo(page, fraction) {
  const target = await page.evaluate(
    (f) => (document.documentElement.scrollHeight - window.innerHeight) * f,
    fraction,
  );

  for (let i = 0; i < 90; i++) {
    const current = await page.evaluate(() => window.scrollY);
    const diff = target - current;
    if (Math.abs(diff) < 40) break;
    await page.mouse.wheel(0, Math.max(-900, Math.min(900, diff)));
    await wait(90);
  }
  await wait(900);
}

async function shoot(page, name) {
  if (only && !only.some((entry) => name.includes(entry))) return;
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("captured", name);
}

const run = async () => {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium",
    args: [
      "--use-angle=swiftshader",
      "--use-gl=angle",
      "--enable-unsafe-swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--disable-lcd-text",
    ],
  });

  const errors = [];

  // ---------------------------------------------------------------- desktop
  const desktop = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
  });
  const page = await desktop.newPage();
  page.on("pageerror", (error) => errors.push(`[pageerror] ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`[console] ${message.text()}`);
  });

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(page, 2600);
  await shoot(page, "01-hero");

  // Pointer response: push the cursor to the top-left, then bottom-right.
  await page.mouse.move(DESKTOP.width * 0.2, DESKTOP.height * 0.28, { steps: 24 });
  await wait(900);
  await shoot(page, "02-hero-pointer-left");
  await page.mouse.move(DESKTOP.width * 0.82, DESKTOP.height * 0.72, { steps: 24 });
  await wait(900);
  await shoot(page, "03-hero-pointer-right");
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2, { steps: 12 });

  // Scroll-driven camera at several depths.
  const depths = [0.08, 0.16, 0.3, 0.45, 0.6, 0.75, 0.9];
  for (const [index, depth] of depths.entries()) {
    await scrollTo(page, depth);
    await shoot(page, `04-scroll-${String(index + 1).padStart(2, "0")}-${depth}`);
  }

  await scrollTo(page, 1);
  await shoot(page, "05-footer");

  // Menu page
  await page.goto(`${BASE}/menu`, { waitUntil: "domcontentloaded" });
  await settle(page, 2200);
  await shoot(page, "06-menu-top");
  await scrollTo(page, 0.35);
  await shoot(page, "07-menu-list");

  // Story + contact
  await page.goto(`${BASE}/story`, { waitUntil: "domcontentloaded" });
  await settle(page, 1800);
  await shoot(page, "08-story");
  await scrollTo(page, 0.5);
  await shoot(page, "09-story-mid");

  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  await settle(page, 1600);
  await shoot(page, "10-contact");

  await page.goto(`${BASE}/this-page-does-not-exist`, {
    waitUntil: "domcontentloaded",
  });
  await settle(page, 1200);
  await shoot(page, "11-404");

  // Tray drawer
  await page.goto(`${BASE}/menu`, { waitUntil: "domcontentloaded" });
  await settle(page, 1800);
  const addButton = page.locator("[data-add-to-tray]").first();
  if (await addButton.count()) {
    await addButton.click();
    await wait(500);
    await page.getByRole("button", { name: /^Tray/ }).first().click();
    await wait(900);
    await shoot(page, "12-tray");
  }

  // ---------------------------------------------------------- reduced motion
  const reducedContext = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(reducedPage, 2400);
  await reducedPage.screenshot({
    path: path.join(OUT, "13-hero-reduced-motion.png"),
  });
  console.log("captured 13-hero-reduced-motion");
  await reducedContext.close();

  // ----------------------------------------------------------- no WebGL path
  const noGl = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
  });
  await noGl.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (typeof type === "string" && type.includes("webgl")) return null;
      return original.call(this, type, ...rest);
    };
  });
  const noGlPage = await noGl.newPage();
  await noGlPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(noGlPage, 2200);
  await noGlPage.screenshot({ path: path.join(OUT, "14-hero-no-webgl.png") });
  console.log("captured 14-hero-no-webgl");
  await noGl.close();

  // ------------------------------------------------------------------ mobile
  const mobile = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (error) =>
    errors.push(`[mobile pageerror] ${error.message}`),
  );

  await mobilePage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(mobilePage, 2600);
  await mobilePage.screenshot({ path: path.join(OUT, "20-mobile-hero.png") });
  console.log("captured 20-mobile-hero");

  for (const [index, depth] of [0.2, 0.45, 0.7].entries()) {
    await scrollTo(mobilePage, depth);
    await mobilePage.screenshot({
      path: path.join(OUT, `21-mobile-scroll-${index + 1}.png`),
    });
    console.log(`captured 21-mobile-scroll-${index + 1}`);
  }

  await mobilePage.goto(`${BASE}/menu`, { waitUntil: "domcontentloaded" });
  await settle(mobilePage, 2000);
  await mobilePage.screenshot({ path: path.join(OUT, "22-mobile-menu.png") });
  console.log("captured 22-mobile-menu");

  await mobile.close();
  await desktop.close();
  await browser.close();

  if (errors.length) {
    console.log("\n--- page errors ---");
    console.log([...new Set(errors)].join("\n"));
  } else {
    console.log("\nno page errors");
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
