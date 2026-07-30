import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  assertReleaseWorkspaceClean,
  assertRepositoryHygiene,
  buildArtifactEvidence,
  collectReleaseEnvironment
} from './phase0-release-evidence.mjs';

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
  npmGate('clean dependency install',['ci','--no-audit','--no-fund']),
  {name:'release evidence unit',command:process.execPath,args:['--test','tests/phase0-release-gate.test.mjs']},
  {name:'adversarial evidence matrix',command:process.execPath,args:['--test','tests/evidence-policy.test.mjs','tests/schedule-gateway.test.mjs','tests/persistence.test.mjs','tests/persistence-core.test.mjs']},
  npmGate('every-store backup sentinel',['run','test:backup']),
  npmGate('restore and rollback safety',['run','test:restore']),
  npmGate('Capture containment and degraded storage',['run','test:capture']),
  npmGate('Today exact-target containment',['run','test:today']),
  {...npmGate('unit and integration tests',['test']),verifyZeroSkipped:true},
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
const root=process.cwd();
let releaseEnvironment=null;
let hygiene=null;
if(!harnessOnly){
  releaseEnvironment=collectReleaseEnvironment(root);
  hygiene=await assertRepositoryHygiene(root);
  console.log(`[PHASE0 RELEASE] ${JSON.stringify({...releaseEnvironment,hygiene})}`);
}
for(const [index,gate] of gates.entries()){
  const gateStarted=performance.now();
  console.log(`\n[PHASE0 GATE ${index+1}/${gates.length}] ${gate.name}`);
  const result=spawnSync(gate.command,gate.args,{
    cwd:process.cwd(),env:process.env,windowsHide:true,
    ...(gate.verifyZeroSkipped?{encoding:'utf8',stdio:['inherit','pipe','pipe'],maxBuffer:16*1024*1024}:{stdio:'inherit'})
  });
  if(gate.verifyZeroSkipped){
    if(result.stdout)process.stdout.write(result.stdout);
    if(result.stderr)process.stderr.write(result.stderr);
  }
  if(result.error){console.error(`[INFRASTRUCTURE_FAILURE] Could not start ${gate.name}: ${result.error.message}`);process.exit(result.status||1);}
  if(result.status!==0){console.error(`[GATE_FAILURE] ${gate.name} failed with exit ${result.status}; no later gate was run.`);process.exit(result.status||1);}
  if(gate.verifyZeroSkipped){
    const output=`${result.stdout||''}\n${result.stderr||''}`;
    if(!/\bskipped\s+0\b/i.test(output)||!/\btodo\s+0\b/i.test(output)){
      console.error(`[GATE_FAILURE] ${gate.name} did not prove zero skipped/todo tests.`);
      process.exit(1);
    }
  }
  console.log(`[PHASE0 PASS] ${gate.name} (${((performance.now()-gateStarted)/1000).toFixed(1)}s)`);
}
if(harnessOnly){
  console.log(`\nPHASE0 HARNESS PASSED: ${gates.length}/${gates.length} gates in ${((performance.now()-startedAt)/1000).toFixed(1)}s.`);
}else{
  assertReleaseWorkspaceClean(root,{expectedCommit:releaseEnvironment.commit});
  const artifact=await buildArtifactEvidence(root);
  console.log(`\n[PHASE0 ACCEPTANCE EVIDENCE] ${JSON.stringify({...releaseEnvironment,hygiene,artifact:{algorithm:artifact.algorithm,digest:artifact.digest,fileCount:artifact.fileCount,totalBytes:artifact.totalBytes},gateCount:gates.length})}`);
  console.log(`PHASE0 GATE PASSED: ${gates.length}/${gates.length} gates in ${((performance.now()-startedAt)/1000).toFixed(1)}s.`);
}
