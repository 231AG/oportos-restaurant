const BASE = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3100";
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on("pageerror", e => console.log("PAGEERROR:", e.message));
const ok = (label, cond) => console.log((cond ? "PASS  " : "FAIL  ") + label);

// --- tray flow ---
await p.goto(BASE + "/menu", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2500);
const adds = p.locator("[data-add-to-tray]");
await adds.nth(0).click(); await p.waitForTimeout(200);
await adds.nth(1).click(); await p.waitForTimeout(200);
await adds.nth(1).click(); await p.waitForTimeout(400);
const badge = await p.locator("header button", { hasText: "Tray" }).innerText();
ok("tray badge counts 3 -> " + badge.replace(/\n/g," "), badge.includes("3"));
await p.locator("header button", { hasText: "Tray" }).click();
await p.waitForTimeout(800);
ok("tray dialog open", await p.locator('[role=dialog][aria-label="Your tray"]').isVisible());
await p.locator('[aria-label^="Increase"]').first().click();
await p.waitForTimeout(300);
const href = await p.locator('[role=dialog] a[href*="wa.me"]').first().getAttribute("href");
const msg = decodeURIComponent(href.split("text=")[1]);
ok("cart message lists qty+total", /Total: £/.test(msg) && /2 × /.test(msg));
console.log("      " + msg.split("\n").filter(Boolean).join(" / "));
// persistence
await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(2200);
const badge2 = await p.locator("header button", { hasText: "Tray" }).innerText();
ok("tray persists across reload -> " + badge2.replace(/\n/g," "), badge2.includes("4"));
// escape closes
await p.locator("header button", { hasText: "Tray" }).click(); await p.waitForTimeout(600);
await p.keyboard.press("Escape"); await p.waitForTimeout(600);
ok("escape closes tray", await p.locator('[role=dialog][aria-label="Your tray"]').count() === 0);

// --- dish detail modal ---
await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2500);
for (let i=0;i<40;i++){ await p.mouse.wheel(0,600); await p.waitForTimeout(60); }
await p.waitForTimeout(1200);
const viewDish = p.getByRole("button", { name: "View dish" });
if (await viewDish.count()) {
  await viewDish.first().click(); await p.waitForTimeout(900);
  ok("dish detail dialog opens", await p.locator('[role=dialog]').first().isVisible());
  const ing = await p.locator('[role=dialog] ul li').count();
  ok("dish detail lists ingredients ("+ing+")", ing >= 3);
  await p.keyboard.press("Escape"); await p.waitForTimeout(1200);
  ok("escape closes dish detail", await p.locator('[role=dialog]').count() === 0);
} else ok("view dish button reachable", false);

// --- keyboard nav ---
await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2200);
await p.keyboard.press("Tab");
const first = await p.evaluate(() => document.activeElement?.textContent?.trim());
ok("first tab stop is skip link -> " + first, /skip to content/i.test(first||""));
const stops = [];
for (let i=0;i<10;i++){ await p.keyboard.press("Tab"); stops.push(await p.evaluate(() => document.activeElement?.textContent?.trim().slice(0,20))); }
console.log("      tab order:", stops.join(" > "));

// --- mobile menu ---
const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mp = await mctx.newPage();
await mp.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await mp.waitForTimeout(2500);
await mp.locator('[aria-label="Open menu"]').click();
await mp.waitForTimeout(800);
ok("mobile menu opens", await mp.locator("#mobile-menu").isVisible());
await mp.screenshot({ path: "screenshots/23-mobile-menu-open.png" });
await mp.locator("#mobile-menu a", { hasText: "Menu" }).first().click();
await mp.waitForTimeout(1500);
ok("mobile nav navigates -> " + mp.url().replace(BASE,""), mp.url().endsWith("/menu"));
ok("mobile menu closed after nav", await mp.locator("#mobile-menu").count() === 0);
await b.close();
