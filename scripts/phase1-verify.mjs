import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { performance } from 'node:perf_hooks';

const fallbackNpmCli=join(dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
const npmCli=process.env.npm_execpath||(existsSync(fallbackNpmCli)?fallbackNpmCli:null);
if(!npmCli){
  console.error('[INFRASTRUCTURE_FAILURE] npm CLI path is unavailable; run through npm run phase1:verify.');
  process.exit(1);
}
const npmGate=(name,script)=>({name,command:process.execPath,args:[npmCli,'run',script]});
const gates=[
  npmGate('migration ledger','test:p1-migrations'),
  npmGate('learning contracts','test:p1-contracts'),
  npmGate('event repositories','test:p1-events'),
  npmGate('cross-DB reconciler','test:p1-reconciler'),
  npmGate('unified Capture','test:p1-capture'),
  npmGate('transcript aggregate','test:p1-transcripts'),
  npmGate('global Error Repository','test:p1-errors'),
  npmGate('Today Composer','test:p1-today'),
  npmGate('Today Runner and IA','test:p1-runner'),
  {name:'full unit and integration suite',command:process.execPath,args:[npmCli,'test'],verifyZeroSkipped:true},
  npmGate('static checks','check'),
  npmGate('roadmap audit','audit:roadmap'),
  npmGate('IELTS audit','audit:ielts'),
  npmGate('V10 audit','audit:v10'),
  npmGate('production build','build'),
  npmGate('server smoke','test:serve'),
  npmGate('preview smoke','test:preview'),
  npmGate('browser harness unit','test:browser-harness'),
  npmGate('Core production browser','test:browser'),
  npmGate('IELTS production browser','test:ielts-browser'),
  npmGate('V10 production browser','test:v10-browser'),
  npmGate('hardening production browser','test:hardening')
];

const startedAt=performance.now();
for(const[index,gate]of gates.entries()){
  const gateStarted=performance.now();
  console.log(`\n[PHASE1 VERIFY ${index+1}/${gates.length}] ${gate.name}`);
  const result=spawnSync(gate.command,gate.args,{
    cwd:process.cwd(),
    env:process.env,
    windowsHide:true,
    ...(gate.verifyZeroSkipped?{encoding:'utf8',stdio:['inherit','pipe','pipe'],maxBuffer:32*1024*1024}:{stdio:'inherit'})
  });
  if(gate.verifyZeroSkipped){
    if(result.stdout)process.stdout.write(result.stdout);
    if(result.stderr)process.stderr.write(result.stderr);
  }
  if(result.error){
    console.error(`[INFRASTRUCTURE_FAILURE] Could not start ${gate.name}: ${result.error.message}`);
    process.exit(result.status||1);
  }
  if(result.status!==0){
    console.error(`[GATE_FAILURE] ${gate.name} failed with exit ${result.status}; no later gate was run.`);
    process.exit(result.status||1);
  }
  if(gate.verifyZeroSkipped){
    const output=`${result.stdout||''}\n${result.stderr||''}`;
    if(!/\bskipped\s+0\b/i.test(output)||!/\btodo\s+0\b/i.test(output)){
      console.error(`[GATE_FAILURE] ${gate.name} did not prove zero skipped/todo tests.`);
      process.exit(1);
    }
  }
  console.log(`[PHASE1 PASS] ${gate.name} (${((performance.now()-gateStarted)/1000).toFixed(1)}s)`);
}
console.log(`\nPHASE1 IMPLEMENTATION VERIFICATION PASSED: ${gates.length}/${gates.length} gates in ${((performance.now()-startedAt)/1000).toFixed(1)}s.`);
