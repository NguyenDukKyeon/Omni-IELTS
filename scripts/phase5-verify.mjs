import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { performance } from 'node:perf_hooks';

const fallback=join(dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
const npmCli=process.env.npm_execpath||(existsSync(fallback)?fallback:null);
if(!npmCli){console.error('[INFRASTRUCTURE_FAILURE] npm CLI path unavailable.');process.exit(1);}

const gates=['test:phase5','test:backup','test:restore','test:phase5-browser'],started=performance.now();
for(const [index,script] of gates.entries()){
  console.log(`\n[PHASE5 VERIFY ${index+1}/${gates.length}] ${script}`);
  const result=spawnSync(process.execPath,[npmCli,'run',script],{cwd:process.cwd(),env:process.env,stdio:'inherit',windowsHide:true});
  if(result.error||result.status!==0){console.error(`[GATE_FAILURE] ${script} failed.`);process.exit(result.status||1);}
}
console.log(`\nPHASE5 VERIFICATION PASSED: ${gates.length}/${gates.length} gates in ${((performance.now()-started)/1000).toFixed(1)}s.`);
