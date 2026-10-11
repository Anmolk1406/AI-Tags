import { useEffect, useRef, useState } from 'react';
import { Overline, SegmentedControl, Textarea, buttonClasses, cn } from 'lightweight-ui';
import { ArrowUp, Check, CheckCircle, CircleNotch, Copy, CursorClick, Diamond, Sparkle, UploadSimple, Warning, X } from 'lightweight-ui/icons';
import { appendMemory } from './bridge';
import { ChatTab, ClaudePill, useChat } from './Chat';
import {
  boxSides,
  colorTokens,
  findRule,
  fontSizeTokens,
  fontWeightTokens,
  isShared,
  joinBox,
  moduleClasses,
  ownText,
  parseInput,
  pxNumber,
  radiusTokens,
  spaceTokens,
  tokenName,
  typeTokens,
  type ModuleClass,
  type TokenOption,
} from './inspect';
import { describeChange, type ApplyResult, type Editor } from './useEditor';
import { TokenPicker, type Kind } from './TokenPicker';

type Tab = 'design' | 'chat';

/**
 * Edit mode's right panel: a fixed header (Design | Chat tabs and an
 * always-visible Claude status pill), a scrolling body, and a pinned footer
 * (pending changes, or the chat composer). Design is laid out like Figma's
 * Design tab (selection, then Layout · Appearance · Fill · Typography · Content
 * · Image, with token pickers) plus the pending changes. Chat talks to the
 * visitor's local Claude Code about the selection.
 */
export function DesignPanel({ editor, root, flowId, draftId, onActivity }: { editor: Editor; root: HTMLElement | null; flowId?: string; draftId: string; onActivity?: () => void }) {
  const [tab, setTab] = useState<Tab>('design');
  const chat = useChat(editor, flowId, draftId, onActivity); // lives here so switching tabs keeps the conversation
  const tabs = [
    { value: 'design', label: 'Design', count: editor.pending.length || undefined },
    { value: 'chat', label: 'Chat' },
  ] as const;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none items-center justify-between gap-2 border-b border-line px-5 py-3">
        <SegmentedControl label="Panel" items={tabs} value={tab} onChange={setTab} />
        <ClaudePill editor={editor} onClick={() => setTab('chat')} />
      </div>
      {tab === 'design' ? <DesignTab editor={editor} root={root} onChat={() => setTab('chat')} /> : <ChatTab editor={editor} chat={chat} />}
    </div>
  );
}

function DesignTab({ editor, root, onChat }: { editor: Editor; root: HTMLElement | null; onChat: () => void }) {
  const { selected, select, classIndex, setClassIndex, version } = editor;
  void version; // re-render on live edits and hot reloads
  const classes = selected ? moduleClasses(selected) : [];
  const mc = classes[classIndex] ?? classes[0];
  const parent = selected?.parentElement && root?.contains(selected.parentElement) && selected.parentElement !== root ? selected.parentElement : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
        {selected ? (
          <>
            <header className="border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#0d99ff]/15 px-1.5 py-0.5 font-mono text-caption text-[#4db3ff]">{selected.tagName.toLowerCase()}</span>
                <h3 className="min-w-0 flex-1 truncate text-ui font-semibold">{mc ? `.${mc.local}` : 'Element'}</h3>
                <IconBtn label="Select parent" disabled={!parent} onClick={() => parent && select(parent)}>
                  <ArrowUp size={14} />
                </IconBtn>
                <IconBtn label="Deselect (Esc)" onClick={() => select(null)}>
                  <X size={14} />
                </IconBtn>
              </div>
              {classes.length > 1 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {classes.map((c, i) => (
                    <button
                      key={c.scoped}
                      type="button"
                      onClick={() => setClassIndex(i)}
                      className={cn('rounded-md px-1.5 py-0.5 font-mono text-caption', i === classIndex ? 'bg-ink text-on-ink' : 'bg-ink/[0.06] text-muted hover:text-ink')}
                    >
                      .{c.local}
                    </button>
                  ))}
                </div>
              )}
              {mc ? (
                <>
                  <p className="mt-2 truncate font-mono text-caption text-muted" title={mc.file ?? undefined}>
                    {mc.file ?? 'Stylesheet unknown — reload the page'}
                  </p>
                  <p className={cn('mt-2 flex items-start gap-1.5 text-caption leading-relaxed', isShared(mc.file) ? 'text-[#FF9741]' : 'text-muted')}>
                    {isShared(mc.file) && <Warning size={13} className="mt-px flex-none" aria-hidden />}
                    {isShared(mc.file) ? 'Shared component: edits change every flow that uses it.' : `Edits change every element using .${mc.local}.`}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-caption leading-relaxed text-muted">No stylesheet class on this element. Select a parent, or ask Claude in the Chat tab.</p>
              )}
            </header>
            {mc && <Properties el={selected} mc={mc} editor={editor} />}
            <Content el={selected} editor={editor} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="grid size-11 place-items-center rounded-xl border border-dashed border-line-strong text-muted">
              <CursorClick size={20} aria-hidden />
            </span>
            <p className="mt-4 text-ui font-medium">Select a layer to edit</p>
            <p className="mt-1 max-w-[30ch] text-label leading-relaxed text-muted">Click anything on the phone or in Layers. Or switch to Chat to fix it with AI.</p>
            <button type="button" onClick={onChat} className={cn(buttonClasses({ variant: 'secondary', size: 'sm' }), 'mt-4')}>
              <Sparkle size={12} weight="fill" className="text-[#FEEE00]" aria-hidden />
              Open Chat
            </button>
          </div>
        )}
      </div>
      <Changes editor={editor} />
    </div>
  );
}

/* ------------------------------------------------------------- properties */

function Properties({ el, mc, editor }: { el: HTMLElement; mc: ModuleClass; editor: Editor }) {
  const rule = findRule(mc.scoped);
  const cs = getComputedStyle(el);
  const decl = (p: string) => rule?.style.getPropertyValue(p).trim() ?? '';
  const inline = (p: string) => !!el.style.getPropertyValue(p);
  const set = (prop: string, value: string) => editor.setCss(mc, prop, value);

  const box = (prop: 'padding' | 'margin', sides: [string, string, string, string]) => {
    const declared = decl(prop);
    return declared ? boxSides(declared) : sides;
  };
  const padding = box('padding', [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]);
  const margin = box('margin', [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft]);
  const radius = decl('border-radius') ? boxSides(decl('border-radius')) : [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
  const flexy = /flex|grid/.test(cs.display);
  const bg = decl('background-color') || (tokenName(decl('background')) ? decl('background') : '') || cs.backgroundColor;
  const hasBorder = parseFloat(cs.borderTopWidth) > 0;

  return (
    <>
      <Section title="Layout">
        <Grid cols={2}>
          <Field prefix="W" value={decl('width') || cs.width} declared={!!decl('width')} inline={inline('width')} onCommit={(v) => set('width', v)} />
          <Field prefix="H" value={decl('height') || cs.height} declared={!!decl('height')} inline={inline('height')} onCommit={(v) => set('height', v)} />
        </Grid>
        <BoxField label="Padding" sides={padding} declared={!!decl('padding')} tokens={spaceTokens} inline={inline('padding')} onCommit={(s) => set('padding', joinBox(s))} />
        <BoxField label="Margin" sides={margin} declared={!!decl('margin')} tokens={spaceTokens} inline={inline('margin')} onCommit={(s) => set('margin', joinBox(s))} />
        {flexy && (
          <Grid cols={2}>
            <Field label="Gap" prefix="↔" value={decl('gap') || (cs.rowGap === 'normal' ? '0px' : cs.rowGap)} declared={!!decl('gap')} tokens={spaceTokens} inline={inline('gap')} onCommit={(v) => set('gap', v)} />
          </Grid>
        )}
      </Section>

      <Section title="Appearance">
        <Grid cols={2}>
          <Field label="Opacity" prefix="◐" value={decl('opacity') || cs.opacity} declared={!!decl('opacity')} unitless inline={inline('opacity')} onCommit={(v) => set('opacity', v.replace(/px$/, ''))} />
        </Grid>
        <BoxField label="Corner radius" corners sides={radius as [string, string, string, string]} declared={!!decl('border-radius')} tokens={radiusTokens} inline={inline('border-radius')} onCommit={(s) => set('border-radius', joinBox(s))} />
      </Section>

      <Section title="Fill">
        <ColorField label="Background" value={bg} declared={bg !== cs.backgroundColor || !!decl('background-color')} inline={inline('background-color') || inline('background')} onCommit={(v) => set('background-color', v)} />
        <ColorField label="Text" value={decl('color') || cs.color} declared={!!decl('color')} inline={inline('color')} onCommit={(v) => set('color', v)} />
        {hasBorder && <ColorField label="Border" value={decl('border-color') || cs.borderTopColor} declared={!!decl('border-color')} inline={inline('border-color')} onCommit={(v) => set('border-color', v)} />}
      </Section>

      <Section title="Typography">
        <TokenSelect label="Text style" value={decl('font')} tokens={typeTokens} placeholder={`${pxNumber(cs.fontSize)}/${pxNumber(cs.lineHeight)} · ${cs.fontWeight}`} onCommit={(v) => set('font', v)} />
        <Grid cols={3}>
          <Field label="Size" prefix="Aa" value={decl('font-size') || cs.fontSize} declared={!!decl('font-size')} tokens={fontSizeTokens} inline={inline('font-size')} onCommit={(v) => set('font-size', v)} />
          <Field label="Weight" prefix="B" value={decl('font-weight') || cs.fontWeight} declared={!!decl('font-weight')} tokens={fontWeightTokens} unitless inline={inline('font-weight')} onCommit={(v) => set('font-weight', v.replace(/px$/, ''))} />
          <Field label="Line" prefix="↕" value={decl('line-height') || cs.lineHeight} declared={!!decl('line-height')} inline={inline('line-height')} onCommit={(v) => set('line-height', v)} />
        </Grid>
      </Section>
    </>
  );
}

function Content({ el, editor }: { el: HTMLElement; editor: Editor }) {
  const text = ownText(el);
  const img = el instanceof HTMLImageElement ? el : null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(text ?? '');
  useEffect(() => setDraft(ownText(el) ?? ''), [el]);
  if (!text && !img) return null;
  return (
    <Section title={img ? 'Image' : 'Content'}>
      {text != null && !img && (
        <Textarea
          aria-label="Text"
          value={draft}
          rows={2}
          autoGrow
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft !== text && editor.setText(el, draft)}
          className="text-label"
        />
      )}
      {img && (
        <div className="flex items-center gap-3">
          <img src={img.currentSrc || img.src} alt="" className="size-14 flex-none rounded-md bg-ink/[0.05] object-contain ring-1 ring-line" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-caption text-muted" title={img.src}>
              {decodeURIComponent(new URL(img.src, location.href).pathname.split('/').pop() ?? '')}
            </p>
            <button type="button" onClick={() => fileRef.current?.click()} className={cn(buttonClasses({ variant: 'secondary', size: 'sm' }), 'mt-1.5')}>
              <UploadSimple size={13} aria-hidden />
              Replace image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) editor.setAsset(img, f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- changes */

function Changes({ editor }: { editor: Editor }) {
  const { pending, bridge } = editor;
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ApplyResult[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const results = await editor.apply();
      setResults(results);
      const done = results.filter((r) => r.ok);
      if (done.length) await appendMemory(`- ${new Date().toISOString().slice(0, 10)} · applied in the studio: ${done.map((r) => r.message).join('; ')}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex-none border-t border-line px-5 py-4">
      <div className="flex items-center justify-between">
        <Overline>Changes</Overline>
        <span className="text-caption tabular-nums text-muted">{pending.length}</span>
      </div>
      {pending.length ? (
        <ol className="mt-2 max-h-28 space-y-1 overflow-y-auto">
          {pending.map((p) => (
            <li key={p.key} className="truncate font-mono text-caption text-ink/80" title={describeChange(p)}>
              {p.kind === 'css' ? `.${p.local} ${p.prop}: ${p.to}` : p.kind === 'text' ? `“${p.to}”` : `image → ${p.name}`}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-caption text-muted">No edits yet.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" disabled={!pending.length || !bridge || busy} onClick={apply} title={bridge ? undefined : 'Run the studio locally (npm run dev) to write files'} className={buttonClasses({ variant: 'primary', size: 'sm' })}>
          {busy ? <CircleNotch size={13} className="animate-spin" aria-hidden /> : <Check size={13} weight="bold" aria-hidden />}
          Apply to code
        </button>
        <button
          type="button"
          disabled={!pending.length}
          onClick={async () => {
            await navigator.clipboard.writeText(editor.prompt());
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className={buttonClasses({ variant: 'secondary', size: 'sm' })}
        >
          {copied ? <Check size={13} weight="bold" aria-hidden /> : <Copy size={13} aria-hidden />}
          {copied ? 'Copied' : 'Copy for Claude'}
        </button>
        <button type="button" disabled={!pending.length} onClick={editor.discard} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
          Discard
        </button>
      </div>
      {error && <p className="mt-2 text-caption text-danger">{error}</p>}
      {results && (
        <ul className="mt-2 space-y-1">
          {results.map((r, i) => (
            <li key={i} className={cn('flex items-start gap-1.5 text-caption', r.ok ? 'text-muted' : 'text-danger')}>
              {r.ok ? <CheckCircle size={13} weight="fill" className="mt-px flex-none text-[#38AE04]" aria-hidden /> : <Warning size={13} className="mt-px flex-none" aria-hidden />}
              <span className="min-w-0 break-words">{r.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- controls */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5 border-b border-line py-4">
      <h4 className="text-label font-semibold">{title}</h4>
      {children}
    </section>
  );
}

function Grid({ cols, children }: { cols: 2 | 3 | 4; children: React.ReactNode }) {
  return <div className={cn('grid gap-1.5', cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4')}>{children}</div>;
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="u-press grid size-7 place-items-center rounded-md text-muted hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30">
      {children}
    </button>
  );
}

/** Shows a token by name (s12, r16…) and anything else as its px number. */
function display(value: string, tokens: TokenOption[], unitless?: boolean) {
  const name = tokenName(value);
  if (name) return tokens.find((t) => t.value === value)?.label ?? name;
  return unitless ? value : pxNumber(value);
}

function Field({
  label,
  prefix,
  value,
  tokens = [],
  declared,
  inline,
  unitless,
  onCommit,
}: {
  label?: string;
  prefix: string;
  value: string;
  tokens?: TokenOption[];
  declared?: boolean;
  inline?: boolean;
  unitless?: boolean;
  onCommit: (v: string) => void;
}) {
  const shown = display(value, tokens, unitless);
  const [draft, setDraft] = useState(shown);
  const [picking, setPicking] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => setDraft(shown), [shown]);
  const isToken = !!tokenName(value);
  const commit = () => {
    if (draft === shown) return;
    onCommit(parseInput(draft, tokens));
  };
  return (
    <label className="block min-w-0" title={inline ? 'Set inline in the component: ask Claude to change it' : value}>
      {label && <span className="mb-1 block text-micro text-muted">{label}</span>}
      <span ref={anchor} className={cn('flex h-8 items-center gap-1.5 rounded-md bg-ink/[0.05] ps-2 pe-1 ring-[#0d99ff] focus-within:ring-1', (picking) && 'ring-1', inline && 'opacity-50')}>
        <span className="w-4 flex-none text-center text-caption text-muted">{prefix}</span>
        <input
          value={draft}
          disabled={inline}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setDraft(shown);
          }}
          className={cn('h-full min-w-0 flex-1 bg-transparent text-caption tabular-nums outline-none', isToken ? 'text-[#4db3ff]' : declared ? 'text-ink' : 'text-muted')}
        />
        {tokens.length > 0 && !inline && (
          <button
            type="button"
            aria-label={`${label ?? prefix} token`}
            aria-expanded={picking}
            onClick={(e) => {
              e.preventDefault();
              setPicking((p) => !p);
            }}
            className={cn('grid size-6 flex-none place-items-center rounded text-muted hover:bg-ink/[0.08] hover:text-ink', picking && 'bg-ink/[0.08] text-ink')}
          >
            <Diamond size={11} weight={isToken ? 'fill' : 'regular'} aria-hidden />
          </button>
        )}
      </span>
      {picking && anchor.current && <TokenPicker anchor={anchor.current} kind={kindOf(tokens)} tokens={tokens} value={value.trim()} onPick={onCommit} onClose={() => setPicking(false)} />}
    </label>
  );
}

function BoxField({
  label,
  sides,
  tokens,
  declared,
  inline,
  corners,
  onCommit,
}: {
  label: string;
  sides: [string, string, string, string];
  tokens: TokenOption[];
  declared: boolean;
  inline?: boolean;
  corners?: boolean;
  onCommit: (s: string[]) => void;
}) {
  const marks = corners ? ['┌', '┐', '┘', '└'] : ['T', 'R', 'B', 'L'];
  return (
    <div>
      <span className="mb-1 block text-micro text-muted">{label}</span>
      <Grid cols={2}>
        {sides.map((v, i) => (
          <Field key={i} prefix={marks[i]} value={v} declared={declared} tokens={tokens} inline={inline} onCommit={(nv) => onCommit(sides.map((s, j) => (j === i ? nv : s)))} />
        ))}
      </Grid>
    </div>
  );
}

function ColorField({ label, value, declared, inline, onCommit }: { label: string; value: string; declared: boolean; inline?: boolean; onCommit: (v: string) => void }) {
  const tok = colorTokens.find((t) => t.value === value.trim());
  const none = !tok && /^(transparent|rgba\(0, 0, 0, 0\))$/.test(value.trim());
  const swatch = tok?.hint ?? value;
  const [picking, setPicking] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={anchor}
        type="button"
        disabled={inline}
        aria-expanded={picking}
        onClick={() => setPicking((p) => !p)}
        title={inline ? 'Set inline in the component: ask Claude to change it' : value}
        className={cn('flex h-8 w-full items-center gap-2 rounded-md bg-ink/[0.05] ps-1.5 pe-1 text-start ring-[#0d99ff] hover:bg-ink/[0.07]', picking && 'ring-1', inline && 'opacity-50')}
      >
        <span className="size-5 flex-none rounded ring-1 ring-white/15" style={{ background: swatch }} />
        <span className="w-[4.5rem] flex-none text-micro text-muted">{label}</span>
        <span className={cn('min-w-0 flex-1 truncate font-mono text-caption', tok ? 'text-[#4db3ff]' : declared ? 'text-ink' : 'text-muted')}>{tok ? tok.label : none ? 'None' : toHex(value)}</span>
        {!inline && (
          <span className="grid size-6 flex-none place-items-center rounded text-muted">
            <Diamond size={11} weight={tok ? 'fill' : 'regular'} aria-hidden />
          </span>
        )}
      </button>
      {picking && anchor.current && (
        <TokenPicker anchor={anchor.current} kind="color" tokens={colorTokens} value={tok?.value ?? ''} custom={toHex(swatch)} onPick={onCommit} onClose={() => setPicking(false)} />
      )}
    </>
  );
}

function TokenSelect({ label, value, tokens, placeholder, onCommit }: { label: string; value: string; tokens: TokenOption[]; placeholder: string; onCommit: (v: string) => void }) {
  const tok = tokens.find((t) => t.value === value.trim());
  const [picking, setPicking] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <span className="mb-1 block text-micro text-muted">{label}</span>
      <button
        ref={anchor}
        type="button"
        aria-label={label}
        aria-expanded={picking}
        onClick={() => setPicking((p) => !p)}
        className={cn('flex h-8 w-full items-center gap-2 rounded-md bg-ink/[0.05] px-2 text-start ring-[#0d99ff] hover:bg-ink/[0.07]', picking && 'ring-1')}
      >
        <span className={cn('min-w-0 flex-1 truncate text-caption', tok ? 'text-[#4db3ff]' : 'text-muted')}>{tok ? tok.label : placeholder}</span>
        {tok && <span className="flex-none text-caption text-muted">{tok.hint}</span>}
        <Diamond size={11} weight={tok ? 'fill' : 'regular'} className="flex-none text-muted" aria-hidden />
      </button>
      {picking && anchor.current && <TokenPicker anchor={anchor.current} kind="type" tokens={tokens} value={tok?.value ?? ''} onPick={onCommit} onClose={() => setPicking(false)} />}
    </div>
  );
}

function kindOf(tokens: TokenOption[]): Kind {
  if (tokens === radiusTokens) return 'radius';
  if (tokens === fontSizeTokens) return 'fontSize';
  if (tokens === fontWeightTokens) return 'fontWeight';
  if (tokens === typeTokens) return 'type';
  if (tokens === colorTokens) return 'color';
  return 'space';
}

/** rgb()/rgba()/#rgb → #rrggbb for the colour input; anything unreadable → black. */
function toHex(v: string) {
  const s = v.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s;
  if (/^#[0-9a-f]{3}$/i.test(s)) return `#${[...s.slice(1)].map((c) => c + c).join('')}`;
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return '#000000';
  const [r, g, b] = m[1].split(/[ ,/]+/).map(Number);
  return `#${[r, g, b].map((n) => Math.round(n || 0).toString(16).padStart(2, '0')).join('')}`;
}
