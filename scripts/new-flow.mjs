#!/usr/bin/env node
// Scaffold a new flow:  npm run new-flow -- loyalty "noon Loyalty" "Profile"
// Creates src/flows/<id>/{index.ts,tokens.ts,data.ts,<Name>Screen.tsx,<id>.module.css} and registers it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [id, title = id, group = 'Flows'] = process.argv.slice(2);
if (!id || !/^[a-z][a-zA-Z0-9]*$/.test(id)) {
  console.error('Usage: npm run new-flow -- <flowId camelCase> ["Title"] ["Sidebar group"]');
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/flows', id);
if (existsSync(dir)) {
  console.error(`src/flows/${id} already exists`);
  process.exit(1);
}
const Name = id[0].toUpperCase() + id.slice(1);
mkdirSync(join(dir, 'components'), { recursive: true });

const files = {
  'tokens.ts': `import type { TokenOverrides } from '../../foundations/tokens';

/** Tokens only for the ${title} flow. Override any central token, or add your own keys. */
export const ${id}Tokens = {
  heroGradient: 'linear-gradient(135deg, #0F61FF, #6E51FF)',
} as const;

export const ${id}FlowTokens: TokenOverrides = {
  // colors: { bgPage: '#FFFFFF' },
};
`,
  'data.ts': `import { products } from '../../mocks/products';

/** Mock content for ${title}. Keep copy here so PMs can edit text without touching layout. */
export const ${id}Copy = {
  title: '${title}',
  subtitle: 'Describe what this demo shows',
  cta: 'Continue',
};

export const ${id}Products = products.slice(0, 4);
`,
  [`${Name}Screen.tsx`]: `import { Button, Header, ProductCard, Screen, SectionCard, Text } from '../../components';
import { useNav } from '../../kit/Navigator';
import { FadeIn, Stagger } from '../../motion/recipes';
import { ${id}Copy, ${id}Products } from './data';
import { ${id}Tokens } from './tokens';
import styles from './${id}.module.css';

export function ${Name}Screen() {
  const nav = useNav();
  return (
    <Screen
      header={<Header title={${id}Copy.title} />}
      footer={
        <div className={styles.footer}>
          <Button size="lg" block onClick={() => nav.push('${id}/next', {}, { transition: 'fade-up' })}>
            {${id}Copy.cta}
          </Button>
        </div>
      }
    >
      <FadeIn>
        <div className={styles.hero} style={{ background: ${id}Tokens.heroGradient }}>
          <Text variant="titleLarge" color="textInverse">{${id}Copy.title}</Text>
          <Text color="textInverse">{${id}Copy.subtitle}</Text>
        </div>
      </FadeIn>
      <SectionCard title="Picked for you">
        <Stagger className={styles.grid}>
          {${id}Products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Stagger>
      </SectionCard>
    </Screen>
  );
}

export function ${Name}NextScreen() {
  const nav = useNav();
  return (
    <Screen header={<Header title="Step 2" />}>
      <SectionCard title="All done">
        <Button variant="dark" onClick={() => nav.popToRoot()}>Back to start</Button>
      </SectionCard>
    </Screen>
  );
}
`,
  [`${id}.module.css`]: `.hero { margin: 12px; padding: 24px 16px; border-radius: var(--nk-radius-r16); display: flex; flex-direction: column; gap: 6px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.footer { background: var(--nk-color-bg-surface); padding: 12px 16px calc(var(--nk-inset-bottom) + 8px); box-shadow: var(--nk-shadow-bottom-bar); }
`,
  'index.ts': `import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';

// screens load on demand (only what a page shows is in its first download)
const ${Name}Screen = lazyScreen(() => import('./${Name}Screen'), '${Name}Screen');
const ${Name}NextScreen = lazyScreen(() => import('./${Name}Screen'), '${Name}NextScreen');
import { ${id}FlowTokens } from './tokens';

export const ${id}Flow = defineFlow({
  id: '${id}',
  title: '${title}',
  group: '${group}',
  description: 'TODO: one line on what this flow demos.',
  initial: 'main',
  tokens: ${id}FlowTokens,
  screens: [
    { id: 'main', title: '${title}', component: ${Name}Screen, notes: 'TODO: what to try on this screen.' },
    { id: 'next', title: 'Step 2', component: ${Name}NextScreen, transition: 'fade-up' },
  ],
});
`,
};
for (const [f, c] of Object.entries(files)) writeFileSync(join(dir, f), c);

// register in src/flows/index.ts
const reg = join(root, 'src/flows/index.ts');
let s = readFileSync(reg, 'utf8');
s = s.replace(/(import type \{ FlowDef \} from '..\/kit\/types';\n)/, `$1import { ${id}Flow } from './${id}';\n`);
s = s.replace(/export \{ ([^}]*) \};/, (_, names) => `export { ${names.trim()}, ${id}Flow };`);
s = s.replace(/export const allFlows: FlowDef\[\] = \[([^\]]*)\];/, (_, names) => `export const allFlows: FlowDef[] = [${names.trim()}, ${id}Flow];`);
writeFileSync(reg, s);

console.log(`✔ Created src/flows/${id}  →  open http://localhost:5180/${id}/main`);
