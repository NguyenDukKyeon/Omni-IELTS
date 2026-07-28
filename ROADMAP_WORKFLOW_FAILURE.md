# Roadmap v9 apply failure

The generated implementation stopped before producing a complete patch.

```text
[write] package.json
[write] .github/workflows/ci.yml
[write] src/fsrs-scheduler.js
[write] src/learning.js
[write] src/progress.js
[write] src/persistence.js
file:///tmp/apply-roadmap-v9.mjs:119
  c=replaceRegex(c,/function detailViewMarkup\(card\)\{\n  const now=Date\.now\(\);const required=new Set\(requiredSkillsForCard\(card\)\);const rows=FSRS_SKILLS\.map\(skill=>\{const value=Math\.round\(cardRetrievability\(card,skill,now\)\*100\);const due=getSkillDueAt\(card,skill,now\);const schedule=card\.fsrsBySkill\?\.\[skill\];return`<div class="detail-skill-row">[\s\S]*?\}\)\.join\(''\);/,`function detailViewMarkup(card){\n  const now=Date.now();const planned=new Set(plannedSkillsForCard(card));const rows=FSRS_SKILLS.map(skill=>{const unlocked=skillIsUnlocked(card,skill);const value=Math.round(cardRetrievability(card,skill,now)*100);const due=getSkillDueAt(card,skill,now);const schedule=card.fsrsBySkill?.[skill];const stateText=!planned.has(skill)?'Không thuộc mục tiêu':!unlocked?'Sẽ mở sau kỹ năng nền':Number(schedule?.reps||0)?\`${value}% · \${new Date(due).toLocaleDateString('vi-VN')}\`:'Đã mở · cần học';return\`<div class="detail-skill-row"><span>\${skillName(skill)}\${planned.has(skill)?' *':''}</span><progress max="100" value="\${Number(schedule?.reps||0)?value:0}"></progress><span>\${stateText}</span></div>\`;}).join('');`,'skill detail locked state');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ^

ReferenceError: value is not defined
    at file:///tmp/apply-roadmap-v9.mjs:119:852
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.23.1
```
