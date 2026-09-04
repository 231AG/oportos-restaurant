const BASE = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3100";
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const js = []; const other = [];
p.on("response", async r => {
  const url = r.url(); if (!url.startsWith(BASE)) return;
  let len = 0; try { len = (await r.body()).length; } catch {}
  const rec = { url: url.replace(BASE,""), len, t: Date.now() };
  if (url.endsWith(".js")) js.push(rec); else other.push(rec);
});

await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const tDom = Date.now();
await p.waitForTimeout(5000);
const initial = js.filter(r => r.t <= tDom + 300);
const lazy = js.filter(r => r.t > tDom + 300);
const sum = a => (a.reduce((s,x)=>s+x.len,0)/1024).toFixed(1);
console.log("initial JS:", sum(initial), "KB in", initial.length, "files");
console.log("lazy JS:   ", sum(lazy), "KB in", lazy.length, "files");
console.log("largest lazy:", lazy.sort((a,b)=>b.len-a.len).slice(0,3).map(r=>`${r.url} ${(r.len/1024).toFixed(0)}KB`).join(", "));
console.log("fonts/css:", sum(other.filter(r=>/\.(css|woff2)/.test(r.url))), "KB");
console.log("total transfer:", ((js.concat(other)).reduce((s,x)=>s+x.len,0)/1024).toFixed(1), "KB");
await b.close();
