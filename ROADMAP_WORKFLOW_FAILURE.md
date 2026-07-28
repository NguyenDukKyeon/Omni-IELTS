# Roadmap v9 apply failure

The generated implementation stopped before producing a complete patch.

```text
[write] package.json
file:///tmp/apply-roadmap-v9.mjs:10
  if(!content.includes(search))throw new Error(`Không tìm thấy đoạn cần thay: ${label}`);
                                     ^

Error: Không tìm thấy đoạn cần thay: CI roadmap audit
    at replaceOnce (file:///tmp/apply-roadmap-v9.mjs:10:38)
    at file:///tmp/apply-roadmap-v9.mjs:34:5
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.23.1
```
