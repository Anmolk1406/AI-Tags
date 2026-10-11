// Post-build: strip side-effect CSS imports (e.g. `import '../foundations/global.css';`) from emitted .d.ts files.
// The CSS itself ships bundled as dist-lib/noon-flow-kit.css; leaving the import in types breaks consumers that
// typecheck libraries with `noUncheckedSideEffectImports`.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist-lib/', import.meta.url).pathname;
let changed = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.d.ts')) {
      const src = readFileSync(p, 'utf8');
      const out = src.replace(/^import ['"][^'"]+\.css['"];\r?\n/gm, '');
      if (out !== src) {
        writeFileSync(p, out);
        changed++;
      }
    }
  }
};
walk(root);
console.log(`clean-dts: ${changed} declaration file(s) cleaned`);
