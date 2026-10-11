import { useCallback, useEffect, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { SegmentedControl, buttonClasses, cn, useReducedMotion } from 'lightweight-ui';
import {
  ArrowRight,
  ArrowUUpLeft,
  ArrowUpRight,
  Atom,
  Check,
  Copy,
  CreditCard,
  FileTs,
  Lightning,
  Package,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  Stack,
  Waveform,
} from 'lightweight-ui/icons';
import { allFlows } from '../../flows';
import { colors, radius, spacing } from '../../foundations/tokens';
import { NoonPrototype } from '../../kit/NoonPrototype';
import { easing } from '../../motion/presets';
import { listTransitions } from '../../motion/transitions';
import appIcon from '../../assets/brand/noon-app-icon.png';
import { AsciiCanvas } from './AsciiCanvas';
import { DomeCanvas, domeTimeline } from './DomeCanvas';
import { portal, temple } from './scenes';
import { sound } from './sound';
import { Community } from './Community';
import { FoldHead, Frame, Hatch, mono, square } from './frame';

const PKG = '@noon/flow-kit';
const STUDIO = '#/home/home';

const managers = [
  { value: 'npm', label: 'npm', cmd: `npm install ${PKG}` },
  { value: 'pnpm', label: 'pnpm', cmd: `pnpm add ${PKG}` },
  { value: 'yarn', label: 'yarn', cmd: `yarn add ${PKG}` },
  { value: 'bun', label: 'bun', cmd: `bun add ${PKG}` },
] as const;
type Manager = (typeof managers)[number]['value'];

const firstScreen = (id: string) => `#/${id}/${allFlows.find((f) => f.id === id)?.screens[0]?.id ?? ''}`;
const screenCount = allFlows.reduce((n, f) => n + f.screens.length, 0);
const nav = [
  { label: 'How it works', href: '#how' },
  { label: 'Community', href: '#community' },
  { label: 'Flows', href: '#flows' },
  { label: 'Foundations', href: '#foundations' },
];

const ease = easing.out;

/**
 * Landing page for the npm package (studio chrome → Lightweight UI only, pinned dark).
 *
 *   Gate → Hero (framed: nav, copy, halftone dome + demo card, stack strip) → How it works → Community → Flows → Foundations poster → Make it yours → Footer
 *
 * The gate exists because browsers only allow sound after a click: its single
 * "Get started" press starts the intro and its sound (mute lives in the nav).
 */
export function Landing() {
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [replay, setReplay] = useState(0);

  // Sound starts on unless the visitor muted it last time (nav toggle).
  const enter = useCallback(() => {
    const withSound = sound.preferred;
    sound.unlock(withSound);
    setSoundOn(withSound);
    setEntered(true);
    sound.intro(domeTimeline.settleAt);
    sound.touch(domeTimeline.settleAt);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    sound.setEnabled(next);
    setSoundOn(next);
    if (next) sound.tick();
  };

  const play = () => {
    sound.unlock(true);
    setSoundOn(true);
    setReplay((r) => r + 1);
    sound.intro(domeTimeline.settleAt);
    sound.touch(domeTimeline.settleAt);
  };

  // Dark all the way out: <html> too (page bg, overscroll, scrollbars, selection,
  // portalled overlays). The studio's own theme comes back when it mounts.
  useEffect(() => {
    const root = document.documentElement;
    const prev = { theme: root.dataset.theme, dark: root.classList.contains('dark'), bg: root.style.background };
    root.dataset.theme = 'dark';
    root.classList.add('dark');
    root.style.background = '#000';
    root.style.colorScheme = 'dark';
    return () => {
      if (prev.theme) root.dataset.theme = prev.theme;
      else delete root.dataset.theme;
      root.classList.toggle('dark', prev.dark);
      root.style.background = prev.bg;
      root.style.colorScheme = '';
    };
  }, []);

  return (
    <div
      data-theme="dark"
      // One press sound for every control; capture runs before the control's own handler.
      onClickCapture={(e) => (e.target as Element).closest('a, button, [role="tab"], [role="radio"], label, summary') && sound.click()}
      className="dark min-h-dvh bg-black text-ink [color-scheme:dark] selection:bg-[#FEEE00] selection:text-black"
    >
      <Gate open={!entered} onEnter={enter} />

      <Hero entered={entered} reduced={reduced} soundOn={soundOn} replay={replay} onToggleSound={toggleSound} onPlay={play} />
      <HowItWorks />
      <Community />
      <Flows />
      <Foundations />
      <MakeItYours />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ Gate */

/** First screen: the app icon, a short load, then one way in. Its click is the gesture that unlocks sound. */
function Gate({ open, onEnter }: { open: boolean; onEnter: () => void }) {
  const [pct, setPct] = useState(0);
  const ready = pct >= 100;

  useEffect(() => {
    if (!open) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(100, Math.round(Math.max(0, (now - start) / 1300) ** 0.8 * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open || !ready) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Enter' && onEnter();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, ready, onEnter]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Flow Kit"
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black px-4 transition-[opacity,visibility] duration-700 ease-out',
        open ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_65%)]" />
      <div aria-hidden className="u-circle pointer-events-none absolute start-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-[62%] rounded-full bg-[#FEEE00]/[0.09] blur-[120px]" />

      <div className="relative flex w-full max-w-[360px] flex-col items-center text-center">
        <img src={appIcon} alt="noon" className="size-20 rounded-[22px] [corner-shape:round] shadow-[0_24px_70px_-18px_rgb(254_238_0/0.5)] ring-1 ring-white/10" />
        <h1 className="mt-8 font-pixel text-[clamp(2.75rem,7vw,3.75rem)] leading-none font-medium tracking-[-0.02em]">Flow Kit</h1>
        <p className="mt-3 text-ui text-muted">Real noon screens, ready to click.</p>

        {/* the loader and the button share one slot, so nothing jumps when it's ready */}
        <div className="mt-10 grid h-12 w-full">
          <div className={cn('col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 transition-opacity duration-300', ready && 'opacity-0')}>
            <div className="h-px w-48 overflow-hidden bg-line">
              <div className="h-px bg-[#FEEE00] transition-[width] duration-100" style={{ width: `${pct}%` }} />
            </div>
            <p className={cn(mono, 'tabular-nums text-muted')} aria-live="polite">
              Loading {String(pct).padStart(3, '0')}
            </p>
          </div>
          <div className={cn('col-start-1 row-start-1 transition-[opacity,translate] duration-500 ease-out', ready ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0')}>
            <button type="button" onClick={onEnter} disabled={!ready} className={cn(buttonClasses({ variant: 'primary' }), square, 'h-12 w-full gap-2 text-body')}>
              Get started
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
        <p className={cn(mono, 'mt-5 text-muted/70 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')}>Press ↵ to start</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease, delay: domeTimeline.settleAt - 0.5 + i * 0.12 },
  }),
};



const stack = [
  { icon: Atom, label: 'React 19' },
  { icon: FileTs, label: 'TypeScript' },
  { icon: Lightning, label: 'Vite' },
  { icon: Waveform, label: 'motion' },
  { icon: Stack, label: 'Lottie' },
];
const demoLines = [
  'Welcome to Flow Kit — the noon app, prototyped.',
  'Pick a flow below, or press play to replay the intro.',
]
const demoLinks = [
  { label: 'Open a PDP', icon: Package, href: firstScreen('pdp') },
  { label: 'Run checkout', icon: CreditCard, href: firstScreen('checkout') },
  { label: 'Start a return', icon: ArrowUUpLeft, href: firstScreen('returns') },
];

function Hero({
  entered,
  reduced,
  soundOn,
  replay,
  onToggleSound,
  onPlay,
}: {
  entered: boolean;
  reduced: boolean;
  soundOn: boolean;
  replay: number;
  onToggleSound: () => void;
  onPlay: () => void;
}) {
  const state = entered ? 'show' : 'hidden';
  const words = ['noon', 'prototypes', 'at', 'the', 'speed', 'of', 'thought'];

  return (
    <div className="mx-auto max-w-[1240px] px-3 pt-3 sm:px-6 sm:pt-6">
      {/* Nav, boxed */}
      <motion.div initial="hidden" animate={state} variants={rise} custom={5}>
        <Frame as="header" className="flex h-16 items-center gap-6 px-4 sm:px-6">
          <a href="#/" className="flex flex-none items-center gap-2.5">
            <img src={appIcon} alt="" className="size-7 rounded-[7px] [corner-shape:round]" />
            <span className="text-ui font-semibold tracking-tight">Flow Kit</span>
          </a>
          <nav aria-label="Sections" className="max-md:hidden">
            <ul className="flex items-center gap-7">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} onPointerEnter={() => sound.tick(1.4)} className="text-label text-muted transition-colors duration-150 hover:text-ink">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
              className="u-press grid size-8 place-items-center rounded-[6px] text-muted transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink"
            >
              {soundOn ? <SpeakerHigh size={16} /> : <SpeakerSlash size={16} />}
            </button>
            <a href={STUDIO} className={cn(buttonClasses({ variant: 'secondary', size: 'sm' }), square, 'max-sm:hidden')}>
              Studio
            </a>
            <a href="#how" className={cn(buttonClasses({ variant: 'primary', size: 'sm' }), square)}>
              Get started
            </a>
          </div>
        </Frame>
      </motion.div>
      <Hatch />

      <Frame as="section" aria-labelledby="hero-title" className="overflow-hidden">
        {/* Copy */}
        <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center px-4 pt-20 text-center sm:pt-24">
          <h1 id="hero-title" className="text-balance font-pixel text-[clamp(2.25rem,5.4vw,4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            {words.map((w, i) => (
              <motion.span key={i} initial="hidden" animate={state} variants={rise} custom={0.6 + i * 0.3} className="inline-block whitespace-pre">
                {w}
                {i < words.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </h1>
          <motion.p initial="hidden" animate={state} variants={rise} custom={3.2} className="mt-5 max-w-[52ch] text-ui leading-relaxed text-muted">
            Real noon tokens, components and {allFlows.length} ready-made flows, ported 1:1 from bappzaar. Built for designers
            and PMs who demo the next idea before the meeting starts.
          </motion.p>
          <motion.div initial="hidden" animate={state} variants={rise} custom={3.8} className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#how" className={cn(buttonClasses({ variant: 'primary' }), square, 'min-w-40')}>
              Install the kit
            </a>
            <a href={STUDIO} className={cn(buttonClasses({ variant: 'secondary' }), square, 'min-w-40 bg-transparent')}>
              Explore the studio
            </a>
          </motion.div>
        </div>

        {/* Dome: halftone sphere and the 3D hands, with the demo card floating in it */}
        <div className="relative -mt-4 h-[clamp(440px,52vw,640px)]">
          <DomeCanvas started={entered} replay={replay} reduced={reduced} />
          <motion.div
            initial="hidden"
            animate={state}
            variants={rise}
            custom={4.6}
            className="absolute start-1/2 top-[19%] w-[min(560px,calc(100%-32px))] -translate-x-1/2"
          >
            <DemoCard onPlay={onPlay} />
          </motion.div>
        </div>

        {/* Stack strip */}
        <ul className="grid grid-cols-2 border-t border-line sm:grid-cols-5">
          {stack.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={cn(
                'flex h-24 items-center justify-center gap-2 border-line text-body font-semibold tracking-tight text-ink/85 sm:h-28',
                i > 0 && 'sm:border-s',
                i % 2 === 1 && 'max-sm:border-s',
                i > 1 && 'max-sm:border-t',
                i === stack.length - 1 && 'max-sm:col-span-2',
              )}
            >
              <Icon size={20} weight="fill" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Frame>
      <Hatch />
    </div>
  );
}

/** The floating card in the dome: types the pitch, links into flows, replays the intro. */
function DemoCard({ onPlay }: { onPlay: () => void }) {
  const [line, setLine] = useState(0);
  const [n, setN] = useState(0);
  const text = demoLines[line];

  useEffect(() => {
    const done = n >= text.length;
    const id = setTimeout(
      () => {
        if (!done) setN(n + 1);
        else {
          setLine((line + 1) % demoLines.length);
          setN(0);
        }
      },
      done ? 2600 : 28,
    );
    return () => clearTimeout(id);
  }, [n, line, text.length]);

  return (
    <div className="rounded-[10px] border border-line-strong bg-[#141414]/92 p-4 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md sm:p-5">
      <div>
        <p className="min-h-12 text-body text-ink" aria-live="off">
          {text.slice(0, n)}
          <span className="ms-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-ink/70" aria-hidden />
        </p>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {demoLinks.map(({ label, icon: Icon, href }) => (
            <li key={label}>
              <a
                href={href}
                onPointerEnter={() => sound.tick(1.1)}
                className="u-circle flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-caption text-ink/85 transition-colors duration-150 hover:border-line-strong hover:bg-ink/[0.04] hover:text-ink"
              >
                <Icon size={13} aria-hidden />
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onPlay}
          aria-label="Replay the intro with sound"
          className="u-press u-circle grid size-10 flex-none place-items-center rounded-full border border-line-strong bg-ink text-on-ink transition-[background-color] duration-150 hover:bg-ink/85"
        >
          <Play size={15} weight="fill" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function InstallPill({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const cmd = `npm i ${PKG}`;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked: the command is visible anyway */
        }
      }}
      className={cn(buttonClasses({ variant: 'primary' }), 'rounded-full font-mono', className)}
    >
      <span className="text-on-ink/50">$</span>
      {cmd}
      <span className="ms-1 grid size-4 place-items-center" aria-hidden>
        {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
      </span>
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  );
}



/* ---------------------------------------------------------- How it works */

const usage = `import { NoonPrototype, allFlows } from '${PKG}';
import '${PKG}/style.css';

<NoonPrototype
  flows={allFlows}
  initialRoute="pdp/detail"
/>`;

const override = `<NoonPrototype
  flows={[pdpFlow, cartFlow, checkoutFlow]}
  tokens={{ colors: { cta: '#0E0E0E' } }}
/>`;

/** Second fold: three steps as rows (step on the left, its snippet on the right), all visible at once. */
function HowItWorks() {
  const [pm, setPm] = useState<Manager>('npm');
  const cmd = managers.find((m) => m.value === pm)!.cmd;

  return (
    <div id="how" className="mx-auto max-w-[1240px] scroll-mt-6 px-3 sm:px-6">
      <Frame as="section" aria-labelledby="how-title">
        <FoldHead id="how-title" title="Three steps to a clickable demo">
          About two minutes, start to finish.
        </FoldHead>

        <ol className="border-t border-line">
          <Step n={1} title="Install" body="Add the kit to any React 19 app.">
            <CodeBox
              label={
                <span role="radiogroup" aria-label="Package manager" className="flex gap-3">
                  {managers.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={pm === m.value}
                      onClick={() => setPm(m.value)}
                      className={cn('transition-colors duration-150', pm === m.value ? 'text-ink' : 'text-muted hover:text-ink/80')}
                    >
                      {m.label}
                    </button>
                  ))}
                </span>
              }
              text={cmd}
            />
          </Step>
          <Step n={2} title="Drop in the player" body="Render noon screens, ready to click.">
            <CodeBox label="App.tsx" text={usage} />
          </Step>
          <Step n={3} title="Make it yours" body="Pick the flows you need and change any token.">
            <CodeBox label="App.tsx" text={override} />
          </Step>
        </ol>
      </Frame>
      <Hatch />
    </div>
  );
}

function Step({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <li className="grid gap-5 border-b border-line px-5 py-7 last:border-b-0 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:py-9">
      <div className="flex gap-5">
        <span className="w-11 flex-none font-pixel text-[2rem] leading-none text-[#FEEE00]/80 tabular-nums">{String(n).padStart(2, '0')}</span>
        <div>
          <h3 className="font-pixel text-[1.5rem] leading-tight font-medium">{title}</h3>
          <p className="mt-2 text-ui text-muted">{body}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  );
}

function CodeBox({ label, text }: { label: React.ReactNode; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-ink/[0.03]">
      <div className="flex h-9 items-center justify-between border-b border-line ps-3.5 pe-1.5 font-mono text-caption text-muted">
        {label}
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy'}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* the text is on screen to select */
            }
          }}
          className="u-press flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink"
        >
          {copied ? <Check size={13} weight="bold" aria-hidden /> : <Copy size={13} aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-caption leading-relaxed text-ink/85 [scrollbar-width:thin]">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ Flows */

const journeys = ['Discovery', 'Shopping', 'Post-order', 'Profile'];

/** One plain line per flow, in the visitor's words (the flow's own description is for engineers). */
const blurbs: Record<string, string> = {
  home: 'The home feed: address, search, hero and deals.',
  search: 'Recent and trending searches, live suggestions.',
  categories: 'Browse categories down to a product list.',
  deals: 'The deals tab with cashback offers.',
  plp: 'Results with filters, sort and product cards.',
  pdp: 'Gallery, price, offers and add to cart.',
  cart: 'Change quantities, apply coupons, see savings.',
  checkout: 'Address, delivery, payment and confirmation.',
  orders: 'Order list, live tracking and cancelling items.',
  returns: 'Start a return, pick a pickup slot, track it.',
  account: 'Profile, security, devices and settings.',
  address: 'Saved addresses, and adding one on the map.',
  cards: 'Saved cards wallet, and adding a new card.',
  noonone: 'Subscribing to noon One.',
  membership: 'Managing a noon One membership.',
  wishlist: 'Collections and saved items.',
};
/** Placeholder flows say so in their description; label them instead of passing them off as done. */
const isStub = (f: (typeof allFlows)[number]) => /\(stub\)/i.test(f.description ?? '');
const blurb = (f: (typeof allFlows)[number]) => blurbs[f.id] ?? f.description?.split(/[.:(]/)[0] ?? '';

/**
 * Third fold: pick a journey, see its flows as real screens, open one.
 * Each card shows the flow's first screen (live, but not interactive here) so
 * the grid reads like a contact sheet of the app.
 */
function Flows() {
  const groups = journeys
    .map((g) => ({ value: g, label: g, count: allFlows.filter((f) => f.group === g).length }))
    .filter((g) => g.count);
  const [journey, setJourney] = useState(groups[0].value);
  const flows = allFlows.filter((f) => f.group === journey);

  return (
    <div id="flows" className="mx-auto max-w-[1240px] scroll-mt-6 px-3 sm:px-6">
      <Frame as="section" aria-labelledby="flows-title">
        <FoldHead id="flows-title" title={`${allFlows.length} flows, ${screenCount} screens, ready to click`}>
          Real noon screens. Pick a journey, then open any flow in the studio and click through it.
        </FoldHead>
        <div className="flex justify-center px-4 pb-10">
          <SegmentedControl label="Journey" items={groups} value={journey} onChange={setJourney} />
        </div>

        <ul className="grid grid-cols-2 border-t border-line md:grid-cols-3 lg:grid-cols-4">
          {flows.map((f) => (
            // Grid lines as 1px shadows (right + bottom), so a short last row leaves no filled gaps.
            <li key={f.id} className="shadow-[1px_0_0_0_var(--color-line),0_1px_0_0_var(--color-line)]">
              <a href={firstScreen(f.id)} className="group flex h-full flex-col p-4 transition-colors duration-200 hover:bg-ink/[0.03] sm:p-5">
                <span className="relative grid place-items-center overflow-hidden rounded-[14px] bg-ink/[0.03] bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:14px_14px] py-5">
                  <span
                    inert
                    className="pg-phone pg-thumb-device pointer-events-none overflow-hidden rounded-[20px] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:-translate-y-1.5"
                  >
                    <NoonPrototype flows={allFlows} initialRoute={`${f.id}/${f.screens[0].id}`} frame={false} scale={0.42} />
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-ui font-medium">{f.title}</span>
                  <ArrowUpRight size={14} aria-hidden className="flex-none text-muted transition-[translate,color] duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </span>
                <span className="mt-1 line-clamp-2 text-caption leading-relaxed text-muted">{blurb(f)}</span>
                <span className={cn(mono, 'mt-auto pt-4', isStub(f) ? 'text-[#FEEE00]/80' : 'text-muted')}>
                  {isStub(f) ? 'Coming soon' : `${f.screens.length} screen${f.screens.length === 1 ? '' : 's'}`}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Frame>
      <Hatch />
    </div>
  );
}


/* ------------------------------------------------------------ Foundations */

const swatches = [
  ['brand', colors.brand],
  ['cta', colors.cta],
  ['primary', colors.primary],
  ['success', colors.success],
  ['textPrimary', colors.textPrimary],
  ['bgPage', colors.bgPage],
] as const;

function Foundations() {
  const hair = 'pointer-events-none absolute bg-white/25';
  return (
    <div id="foundations" className="mx-auto max-w-[1240px] scroll-mt-6 px-3 sm:px-6">
      <Frame as="section" aria-labelledby="foundations-title">

      {/* Poster: columns, stair and stars, with the construction lines of a print layout. */}
      <div className="relative h-[min(110vh,920px)] min-h-[600px] overflow-hidden bg-black">
        <AsciiCanvas scene={temple} cell={9} color grain={0.14} glow={0.5} label="ASCII night sky over a stair to a lit rotunda, framed by fluted columns and blossoms" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className={cn(hair, 'inset-x-0 top-[13%] h-px')} />
          <span className={cn(hair, 'inset-x-0 top-[47%] h-px')} />
          <span className={cn(hair, 'inset-x-0 top-[66%] h-px')} />
          <span className={cn(hair, 'inset-y-0 start-[17%] w-px')} />
          <span className={cn(hair, 'inset-y-0 end-[17%] w-px')} />
          <span className="absolute start-1/2 top-[13%] h-[16%] w-[42%] -translate-x-1/2 -translate-y-1/2 u-circle rounded-[50%] border border-white/30" />
          <span className="absolute start-[25%] top-[56%] size-[19%] -translate-x-1/2 -translate-y-1/2 u-circle rounded-full border border-white/20" />
          <span className="absolute end-[25%] top-[56%] size-[19%] translate-x-1/2 -translate-y-1/2 u-circle rounded-full border border-white/20" />
          {['start-4 top-4', 'end-4 top-4', 'start-4 bottom-4', 'end-4 bottom-4'].map((p) => (
            <span key={p} className={cn('absolute text-white/80', p)}>✦</span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center px-[18%] text-center text-white [text-shadow:0_2px_18px_rgb(0_0_0/0.85),0_0_2px_rgb(0_0_0/0.9)]">
          <h2 id="foundations-title" className="mt-[8.5%] font-pixel text-[clamp(2rem,5.6vw,4.5rem)] leading-none font-medium tracking-[-0.01em] uppercase">
            Tokens first
          </h2>
          <p className="mt-auto mb-[7%] max-w-[40ch] rounded-full bg-black/55 px-5 py-2.5 text-label leading-relaxed text-white backdrop-blur-sm">
            Every colour, space, radius and type size comes from bappzaar. Change one and every flow follows.
          </p>
        </div>
      </div>

      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-black p-5 sm:p-6">
          <p className={cn(mono, 'text-muted')}>Colour</p>
          <ul className="mt-6 grid grid-cols-6 gap-1.5">
            {swatches.map(([name, hex]) => (
              <li key={name} title={`${name} ${hex}`} className="aspect-square rounded-lg border border-white/10" style={{ background: hex }} />
            ))}
          </ul>
          <p className="mt-4 font-mono text-caption text-muted">colors.brand · {colors.brand}</p>
        </div>
        <div className="bg-black p-5 sm:p-6">
          <p className={cn(mono, 'text-muted')}>Type</p>
          <p className="mt-5 font-['Figtree'] text-[40px] leading-none font-bold">Aa</p>
          <p className="mt-4 font-mono text-caption text-muted">Noontree → Figtree · 9 – 40px</p>
        </div>
        <div className="bg-black p-5 sm:p-6">
          <p className={cn(mono, 'text-muted')}>Spacing & radius</p>
          <div className="mt-6 flex h-10 items-end gap-1.5">
            {[spacing.s4, spacing.s8, spacing.s12, spacing.s16, spacing.s24, spacing.s32].map((s) => (
              <span key={s} className="w-full bg-ink/70" style={{ height: s + 6, borderRadius: Math.min(radius.r4, s) }} />
            ))}
          </div>
          <p className="mt-4 font-mono text-caption text-muted">s0 – s80 · r0 – r48</p>
        </div>
        <div className="bg-black p-5 sm:p-6">
          <p className={cn(mono, 'text-muted')}>Motion</p>
          <svg viewBox="0 0 100 40" className="mt-6 h-10 w-full text-ink" aria-hidden>
            <path d="M0 40 C 23 40, 32 0, 100 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="mt-4 font-mono text-caption text-muted">{listTransitions().length} screen transitions</p>
        </div>
      </div>
      </Frame>
      <Hatch />
    </div>
  );
}

/* ----------------------------------------------------------- Make it yours */

function MakeItYours() {
  return (
    <div className="mx-auto max-w-[1240px] px-3 sm:px-6">
      <Frame as="section" aria-labelledby="yours-title" className="relative h-[min(80vh,700px)] min-h-[480px] overflow-hidden bg-black">
        <AsciiCanvas scene={portal} cell={9} color grain={0.18} glow={0.45} label="An iridescent ASCII cloud ring opening onto bright sky" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h2 id="yours-title" className="font-pixel text-[clamp(2.5rem,7vw,5.5rem)] leading-none font-medium tracking-[-0.02em] text-white [text-shadow:0_2px_30px_rgb(0_0_0/0.6)]">
            make it yours
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <InstallPill />
            <a href={STUDIO} className={cn(buttonClasses({ variant: 'secondary' }), 'rounded-full backdrop-blur-md')}>
              Open studio
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
        </div>
      </Frame>
      <Hatch />
    </div>
  );
}

/* ----------------------------------------------------------------- Footer */

function Footer() {
  return (
    <footer className="mx-auto max-w-[1240px] px-3 pb-6 sm:px-6">
      <Frame className="flex flex-wrap items-center gap-x-8 gap-y-4 px-5 py-6 sm:px-8">
        <a href="#/" className="flex items-center gap-2.5">
          <img src={appIcon} alt="" className="size-7 rounded-[7px] [corner-shape:round]" />
          <span className="text-ui font-semibold tracking-tight">Flow Kit</span>
        </a>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {[...nav, { label: 'Studio', href: STUDIO }].map((n) => (
            <a key={n.href} href={n.href} className="text-label text-muted transition-colors duration-150 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <p className={cn(mono, 'ms-auto text-muted')}>© 2026 noon · Prototypes only</p>
      </Frame>
    </footer>
  );
}
