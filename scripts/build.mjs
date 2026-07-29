import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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
await cp(resolve(root,'styles.css'),resolve(dist,'styles.css'),{force:true});
await cp(publicDir,dist,{recursive:true,force:true,errorOnExist:false});

for(const required of [
  'manifest.webmanifest',
  'sw.js',
  'v10.css',
  'content/catalog.json'
]){
  const info=await stat(resolve(dist,required));
  if(!info.isFile())throw new Error(`Build thiếu asset bắt buộc: ${required}`);
}

await build({
  absWorkingDir:root,
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

console.log(`Built Vocab Master v10 multimodal FSRS/PWA at ${dist}`);
