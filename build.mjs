// node build.mjs
//   index.html                -> the GitHub Pages site (full HTML document)
//   module-bay-optimizer.html -> the same page without the document wrapper, for the claude.ai artifact (not committed)
// Both inline engine.js and sprite-data.json into app.html. No game art is included.
import fs from 'fs';
const here = new URL('.', import.meta.url);
const read = f => fs.readFileSync(new URL(f, here), 'utf8');
const engine = read('engine.js').replace(/if \(typeof module[^\n]*\n?/, '');
const page = read('app.html').replace('/*__ENGINE__*/', () => engine).replace('/*__SPRITES__*/null', () => read('sprite-data.json'));

const site = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Fan-made module bay simulator and layout optimizer for the game Probably Stolen.">
<style>html{color-scheme:light}body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",sans-serif}img{max-width:100%}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
${page}
</html>
`;
fs.writeFileSync(new URL('index.html', here), site);
fs.writeFileSync(new URL('module-bay-optimizer.html', here), page);
console.log('wrote index.html', site.length, 'bytes and module-bay-optimizer.html', page.length, 'bytes');
