import { cn } from 'lightweight-ui';

/* Shared pieces of the landing's framed layout. */

export const mono = 'font-mono text-micro uppercase tracking-[0.14em]';
/** Square-cornered buttons, as in the framed sections. */
export const square = '!rounded-[6px]';

/** Hairline frame with L-shaped ticks at its corners, like a print crop. */
export function Frame({ className, children, as: Tag = 'div', ...rest }: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'header' }) {
  const tick = 'pointer-events-none absolute size-2.5 border-white/45';
  return (
    <Tag className={cn('relative border border-line', className)} {...rest}>
      <span aria-hidden className={cn(tick, '-start-px -top-px border-s border-t')} />
      <span aria-hidden className={cn(tick, '-end-px -top-px border-e border-t')} />
      <span aria-hidden className={cn(tick, '-bottom-px -start-px border-b border-s')} />
      <span aria-hidden className={cn(tick, '-bottom-px -end-px border-b border-e')} />
      {children}
    </Tag>
  );
}

/** The diagonal hatch between framed blocks. */
export const Hatch = () => (
  <div aria-hidden className="h-4 border-x border-line bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.09)_0_1px,transparent_1px_6px)]" />
);

/** Centred heading block shared by the framed folds: title, then one line. */
export function FoldHead({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <header className="mx-auto flex max-w-[720px] flex-col items-center px-4 pt-16 pb-12 text-center sm:pt-20">
      <h2 id={id} className="text-balance font-pixel text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.015em]">
        {title}
      </h2>
      <p className="mt-4 max-w-[52ch] text-ui leading-relaxed text-muted">{children}</p>
    </header>
  );
}

