import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist');
const publicDir=resolve(root,'public');

await rm(dist,{recursive:true,force:true});
await mkdir(resolve(dist,'assets'),{recursive:true});

let html=await readFile(resolve(root,'index.html'),'utf8');
html=html.replace(
  '<link rel="stylesheet" href="./styles.css" />',
  '<link rel="manifest" href="/manifest.webmanifest" />\n  <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />\n  <link rel="stylesheet" href="./styles.css" />\n  <link rel="stylesheet" href="/experience.css" />'
);
html=html.replace('<script type="module" src="/src/main.js"></script>','<script type="module" src="./assets/app.js"></script>');
await writeFile(resolve(dist,'index.html'),html);
await cp(resolve(root,'styles.css'),resolve(dist,'styles.css'));

for(const entry of await readdir(publicDir,{withFileTypes:true})){
  await cp(resolve(publicDir,entry.name),resolve(dist,entry.name),{recursive:entry.isDirectory(),force:true});
}

await build({
  entryPoints:[resolve(root,'src/main.js')],
  outfile:resolve(dist,'assets/app.js'),
  bundle:true,
  format:'esm',
  platform:'browser',
  target:['es2022'],
  minify:true,
  legalComments:'none',
  sourcemap:false,
  logLevel:'info'
});

console.log(`Built Vocab Master multimodal FSRS/PWA at ${dist}`);
