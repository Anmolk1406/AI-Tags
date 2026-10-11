import { useEffect, useState } from 'react';
import { Overline, cn } from 'lightweight-ui';
import { Check, Copy } from 'lightweight-ui/icons';
import type { FlowDef, ScreenDef } from '../kit/types';

const PKG = '@noon/flow-kit';

/** View mode's inspector: what the open screen is, and the code to use it from the kit. */
export function AgentPanel({ flow, screen }: { flow?: FlowDef; screen?: ScreenDef }) {
  if (!flow || !screen) return null;
  const index = flow.screens.findIndex((s) => s.id === screen.id);
  const install = `npm install ${PKG}`;
  const code = `import { NoonPrototype, allFlows } from '${PKG}';
import '${PKG}/style.css';

<NoonPrototype flows={allFlows} initialRoute="${flow.id}/${screen.id}" />`;

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h3 className="font-sans text-title font-semibold">{screen.title}</h3>
        <p className="mt-1 text-caption text-muted">
          {flow.title} · {index + 1} of {flow.screens.length}
        </p>
      </div>
      <About flow={flow} screen={screen} />
      <Snippet label="Install" text={install} />
      <Snippet label="Use this screen" text={code} />
      {screen.source && <Snippet label="Ported from bappzaar" text={screen.source} />}
    </section>
  );
}

/** What the screen is (the flow's summary), and how to demo it, folded to a few lines until asked. */
function About({ flow, screen }: { flow: FlowDef; screen: ScreenDef }) {
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [flow.id, screen.id]);
  if (!flow.description && !screen.notes) return null;
  return (
    <div className="flex flex-col gap-2">
      <Overline>About</Overline>
      {flow.description && <p className={cn('text-label leading-relaxed text-muted', !more && 'line-clamp-3')}>{flow.description}</p>}
      {more && screen.notes && (
        <>
          <p className="mt-1 text-label font-medium">How to use it</p>
          <p className="text-label leading-relaxed text-muted">{screen.notes}</p>
        </>
      )}
      <button type="button" onClick={() => setMore((m) => !m)} className="self-start text-caption text-ink/80 underline decoration-line-control underline-offset-4 hover:text-ink">
        {more ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}

function Snippet({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Overline>{label}</Overline>
        <CopyButton text={text} />
      </div>
      <pre className="overflow-x-auto rounded-xl border border-line bg-ink/[0.03] p-3.5 font-mono text-caption leading-relaxed whitespace-pre-wrap text-ink/85">
        <code>{text}</code>
      </pre>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <button
      type="button"
      aria-label={state === 'copied' ? 'Copied' : 'Copy to clipboard'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState('copied');
        } catch {
          setState('failed');
        }
        setTimeout(() => setState('idle'), 1600);
      }}
      className={cn('u-press flex items-center gap-1.5 rounded-lg px-2 py-1 text-caption font-medium text-muted transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink')}
    >
      {state === 'copied' ? <Check size={13} weight="bold" aria-hidden /> : <Copy size={13} aria-hidden />}
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select & copy' : 'Copy'}
    </button>
  );
}
