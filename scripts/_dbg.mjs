import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const p = await ctx.newPage();
p.on("pageerror", e => console.log("PAGEERROR:", e.message));
p.on("console", m => { if (m.type()==="error") console.log("CONSOLE:", m.text().slice(0,200)); });
await p.goto("http://127.0.0.1:3100/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const h = document.querySelector('header');
  const cs = h ? getComputedStyle(h) : null;
  return { header: !!h, opacity: cs?.opacity, transform: cs?.transform, display: cs?.display, z: cs?.zIndex, rect: h?.getBoundingClientRect().toJSON() };
}));
await p.screenshot({path:"screenshots/_dbgmobile.png"});
await b.close();
