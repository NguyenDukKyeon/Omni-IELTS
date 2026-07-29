import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';

const fallbackNpmCli=join(dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
const npmCli=process.env.npm_execpath||(existsSync(fallbackNpmCli)?fallbackNpmCli:null);
if(!npmCli){console.error('[INFRASTRUCTURE_FAILURE] npm CLI path is unavailable; run this gate through npm run phase0:gate.');process.exit(1);}
const npmGate=(name,args)=>({name,command:process.execPath,args:[npmCli,...args]});
const harnessOnly=process.argv.includes('--harness');
const harnessGates=[
  {name:'browser harness unit',command:process.execPath,args:['--test','tests/browser-harness.test.mjs']},
  npmGate('core browser smoke',['run','test:browser']),
  npmGate('IELTS browser smoke',['run','test:ielts-browser']),
  npmGate('V10 browser smoke',['run','test:v10-browser']),
  npmGate('hardening browser smoke',['run','test:hardening'])
];
const fullGates=[
  npmGate('unit and integration tests',['test']),
  npmGate('static checks',['run','check']),
  npmGate('roadmap audit',['run','audit:roadmap']),
  npmGate('IELTS audit',['run','audit:ielts']),
  npmGate('V10 focused tests',['run','test:v10']),
  npmGate('V10 audit',['run','audit:v10']),
  npmGate('production build',['run','build']),
  npmGate('server smoke',['run','test:serve']),
  npmGate('preview smoke',['run','test:preview']),
  ...harnessGates
];

const gates=harnessOnly?harnessGates:fullGates;
const startedAt=performance.now();
for(const [index,gate] of gates.entries()){
  const gateStarted=performance.now();
  console.log(`\n[PHASE0 GATE ${index+1}/${gates.length}] ${gate.name}`);
  const result=spawnSync(gate.command,gate.args,{cwd:process.cwd(),env:process.env,stdio:'inherit',windowsHide:true});
  if(result.error){console.error(`[INFRASTRUCTURE_FAILURE] Could not start ${gate.name}: ${result.error.message}`);process.exit(result.status||1);}
  if(result.status!==0){console.error(`[GATE_FAILURE] ${gate.name} failed with exit ${result.status}; no later gate was run.`);process.exit(result.status||1);}
  console.log(`[PHASE0 PASS] ${gate.name} (${((performance.now()-gateStarted)/1000).toFixed(1)}s)`);
}
console.log(`\nPHASE0 ${harnessOnly?'HARNESS':'GATE'} PASSED: ${gates.length}/${gates.length} gates in ${((performance.now()-startedAt)/1000).toFixed(1)}s.`);
