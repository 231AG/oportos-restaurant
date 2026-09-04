const BASE = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3100";
import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const fs = await import("node:fs/promises");
const axeSource = await fs.readFile(axePath, "utf8");

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
for (const path of ["/", "/menu", "/story", "/contact", "/nope"]) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3000);
  await p.addScriptTag({ content: axeSource });
  const res = await p.evaluate(async () => await window.axe.run(document, { runOnly: ["wcag2a","wcag2aa","wcag21a","wcag21aa"] }));
  console.log("\n=== " + path + " — violations: " + res.violations.length);
  res.violations.forEach(v => {
    console.log(` [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    v.nodes.slice(0,2).forEach(n => console.log("    " + n.target.join(" ") + " :: " + (n.failureSummary||"").split("\n").slice(0,2).join(" | ")));
  });
  await p.close();
}
await b.close();
