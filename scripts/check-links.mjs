const BASE = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3100";
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
for (const path of ["/", "/menu", "/contact", "/story", "/nope"]) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  const links = await p.$$eval("a[href]", as => as.map(a => ({href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel"), text: (a.textContent||"").trim().slice(0,28)})));
  const wa = links.filter(l => l.href.includes("wa.me"));
  const internal = [...new Set(links.filter(l => l.href.startsWith("/")).map(l=>l.href))];
  console.log(`\n=== ${path}: ${wa.length} whatsapp links, internal: ${internal.join(", ")}`);
  const bad = wa.filter(l => !/^https:\/\/wa\.me\/447700900123\?text=/.test(l.href) || l.target !== "_blank" || !(l.rel||"").includes("noopener"));
  console.log(bad.length ? "  BAD: " + JSON.stringify(bad.slice(0,3)) : "  all wa.me links well-formed (number, target, rel)");
  if (wa[0]) console.log("  sample decoded:", decodeURIComponent(wa[0].href.split("text=")[1]).replace(/\n/g," / "));
  const dish = wa.find(l => l.text.toLowerCase().includes("order") && l.href.includes("%E2%80%A2"));
  if (dish) console.log("  dish msg:", decodeURIComponent(dish.href.split("text=")[1]).replace(/\n/g," / "));
  await p.close();
}
await b.close();
