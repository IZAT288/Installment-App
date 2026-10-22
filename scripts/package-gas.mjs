import {
  readFile,
  mkdir,
  copyFile,
  readdir,
  writeFile,
} from "node:fs/promises";
await mkdir(".gas-build", { recursive: true });
const js = await readFile("dist/app.js", "utf8");
const css = await readFile("dist/style.css", "utf8");
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>${css}</style></head><body><div id="root"></div><script type="module">${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
await writeFile(".gas-build/Index.html", html);
for (const name of await readdir("apps-script"))
  await copyFile(`apps-script/${name}`, `.gas-build/${name}`);
console.log("Apps Script deployment bundle prepared in .gas-build/");
