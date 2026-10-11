import { useEffect, useState } from 'react';
import { Input, buttonClasses, cn, timeAgo } from 'lightweight-ui';
import { ArrowUpRight, Check, CheckCircle, Copy, GithubLogo, Globe, LockSimple, Star, Warning, X } from 'lightweight-ui/icons';
import shared from './community.json';
import { FoldHead, Frame, Hatch, mono, square } from './frame';
import { RepoHiddenError, fetchRepo, getToken, parseRepo, setToken, whoAmI, type RepoInfo } from './github';

/**
 * The central list lives in a GitHub repo as `community.json`: an array of
 * `{ "repo": "owner/name", "private": true }` (`private` defaults to false).
 * Set this to that repo ("org/flow-kit") and the list is read live from it, and
 * "Share with everyone" opens a pre-filled issue there. Left empty, the copy
 * bundled with the site is used and sharing copies the entry instead.
 */
const REGISTRY_REPO = '';
const PENDING_KEY = 'nk-community-pending';

type Entry = { repo: string; private?: boolean };

const readPending = (): Entry[] => {
  try {
    const rows = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]') as (string | Entry)[];
    return rows.map((r) => (typeof r === 'string' ? { repo: r } : r));
  } catch {
    return [];
  }
};
const writePending = (list: Entry[]) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* private mode: pending stays for this visit only */
  }
};

/**
 * Community repos: designers and PMs share the Flow Kit prototypes they've
 * built, everyone can take one and build on top. Repo details come live from
 * GitHub. Private repos show for anyone who has access and has connected
 * GitHub; everyone else sees that the repo exists and is private.
 */
export function Community() {
  const [list, setList] = useState<Entry[]>(shared as Entry[]);
  const [pending, setPending] = useState<Entry[]>(readPending);
  const [token, setTokenState] = useState(getToken);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!REGISTRY_REPO) return;
    const ctl = new AbortController();
    fetch(`https://raw.githubusercontent.com/${REGISTRY_REPO}/HEAD/src/app/landing/community.json`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows: Entry[]) => setList(rows))
      .catch(() => {
        /* offline or not published yet: keep the bundled list */
      });
    return () => ctl.abort();
  }, []);

  const onList = new Set(list.map((e) => e.repo.toLowerCase()));
  const mine = pending.filter((e) => !onList.has(e.repo.toLowerCase()));
  const repos = [...mine.map((e) => ({ ...e, pending: true })), ...list.map((e) => ({ ...e, pending: false }))];

  const addPending = (entry: Entry) => {
    if (onList.has(entry.repo.toLowerCase()) || pending.some((p) => p.repo.toLowerCase() === entry.repo.toLowerCase())) return;
    const next = [entry, ...pending];
    setPending(next);
    writePending(next);
  };
  const removePending = (repo: string) => {
    const next = pending.filter((p) => p.repo !== repo);
    setPending(next);
    writePending(next);
  };
  const saveToken = (t: string) => {
    setToken(t);
    setTokenState(t);
    setConnecting(false);
  };

  return (
    <div id="community" className="mx-auto max-w-[1240px] scroll-mt-6 px-3 sm:px-6">
      <Frame as="section" aria-labelledby="community-title">
        <FoldHead id="community-title" title="Prototypes from the team">
          Designers and PMs share the Flow Kit repos they’ve built. Take any of them and build on top.
        </FoldHead>

        <div className="border-t border-line px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-[640px]">
            <AddRepo onShared={addPending} known={(full) => onList.has(full.toLowerCase())} onHidden={() => !token && setConnecting(true)} />
            <GitHubAccess token={token} open={connecting} onOpen={setConnecting} onSave={saveToken} />
          </div>
        </div>

        {repos.length ? (
          <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r) => (
              <li key={`${r.repo}:${token ? 'auth' : 'anon'}`} className="shadow-[1px_0_0_0_var(--color-line),0_1px_0_0_var(--color-line)]">
                <RepoCard entry={r} pending={r.pending} connected={Boolean(token)} onRemove={r.pending ? () => removePending(r.repo) : undefined} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-t border-line px-5 py-14 text-center sm:px-8">
            <span className="mx-auto grid size-11 place-items-center rounded-[10px] border border-dashed border-line-strong text-muted">
              <GithubLogo size={20} aria-hidden />
            </span>
            <p className="mt-4 text-ui font-medium">No shared repos yet</p>
            <p className="mt-1 text-caption text-muted">Add yours above. Once it’s on the central list, everyone sees it here.</p>
          </div>
        )}
      </Frame>
      <Hatch />
    </div>
  );
}

/* ---------------------------------------------------------- GitHub access */

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

/** Lets a visitor connect their own read-only token so private repos they can access load too. */
function GitHubAccess({ token, open, onOpen, onSave }: { token: string; open: boolean; onOpen: (open: boolean) => void; onSave: (token: string) => void }) {
  const [login, setLogin] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!token) return setLogin(null);
    whoAmI(token)
      .then(setLogin)
      .catch(() => setLogin(null));
  }, [token]);

  if (token) {
    return (
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted">
        <CheckCircle size={14} weight="fill" className="text-[#38AE04]" aria-hidden />
        Connected to GitHub{login ? ` as @${login}` : ''}. Private repos you can access will load.
        <button type="button" onClick={() => onSave('')} className="text-ink/80 underline decoration-line-control underline-offset-4 hover:text-ink">
          Disconnect
        </button>
      </p>
    );
  }

  if (!open) {
    return (
      <p className="mt-3 flex items-center gap-2 text-caption text-muted">
        <LockSimple size={14} aria-hidden />
        Private repo?
        <button type="button" onClick={() => onOpen(true)} className="text-ink/85 underline decoration-line-control underline-offset-4 hover:text-ink">
          Connect GitHub
        </button>
      </p>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      await whoAmI(draft.trim());
      onSave(draft.trim());
      setDraft('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-4 rounded-[10px] border border-line-strong bg-ink/[0.03] p-4">
      <p className="text-ui font-medium">Connect GitHub</p>
      <ol className="mt-2 list-decimal space-y-1 ps-4 text-caption leading-relaxed text-muted">
        <li>
          <a href={TOKEN_URL} target="_blank" rel="noreferrer" className="text-ink/85 underline decoration-line-control underline-offset-4 hover:text-ink">
            Create a fine-grained token
          </a>
          .
        </li>
        <li>Under Repository access, pick the repos you want to see here.</li>
        <li>Under Permissions, set Contents to Read-only. Nothing else is needed.</li>
        <li>Paste it below.</li>
      </ol>
      <div className="mt-3 flex gap-2">
        <label htmlFor="gh-token" className="sr-only">
          GitHub token
        </label>
        <Input
          id="gh-token"
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="github_pat_…"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <button type="submit" disabled={!draft.trim() || checking} className={cn(buttonClasses({ variant: 'primary', size: 'md' }), square, 'flex-none')}>
          {checking ? 'Checking…' : 'Connect'}
        </button>
      </div>
      {error && (
        <p className="mt-2 flex items-start gap-2 text-caption text-danger">
          <Warning size={14} aria-hidden className="mt-px flex-none" />
          {error}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-caption text-muted">Stays in this browser and is only sent to GitHub.</p>
        <button type="button" onClick={() => onOpen(false)} className="text-caption text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------- Add form */

type Check = { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; info: RepoInfo };

function AddRepo({ onShared, known, onHidden }: { onShared: (entry: Entry) => void; known: (full: string) => boolean; onHidden: () => void }) {
  const [value, setValue] = useState('');
  const [check, setCheck] = useState<Check>({ state: 'idle' });
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const full = parseRepo(value);
    if (!full) return setCheck({ state: 'error', message: 'Paste a GitHub link like github.com/you/your-prototype.' });
    if (known(full)) return setCheck({ state: 'error', message: 'That repo is already on the list.' });
    setCheck({ state: 'loading' });
    try {
      setCheck({ state: 'ready', info: await fetchRepo(full) });
    } catch (err) {
      setCheck({ state: 'error', message: (err as Error).message });
      // a hidden repo is often a private one: open the connect step right away
      if (err instanceof RepoHiddenError) onHidden();
    }
  };

  const share = async (info: RepoInfo) => {
    const entry: Entry = info.private ? { repo: info.full, private: true } : { repo: info.full };
    const json = JSON.stringify(entry);
    onShared(entry);
    if (REGISTRY_REPO) {
      const body = `Please add this prototype to the community list.\n\nRepo: ${info.url} (${info.private ? 'private' : 'public'})\n\nEntry for community.json:\n\n\`\`\`json\n${json}\n\`\`\``;
      window.open(`https://github.com/${REGISTRY_REPO}/issues/new?title=${encodeURIComponent(`Add prototype: ${info.full}`)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener');
    } else {
      try {
        await navigator.clipboard.writeText(json);
        setCopied(true);
      } catch {
        /* the entry is shown on screen anyway */
      }
    }
    setValue('');
    setCheck({ state: 'idle' });
  };

  return (
    <>
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="add-repo" className="sr-only">
          GitHub repo
        </label>
        <Input
          id="add-repo"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (check.state === 'error') setCheck({ state: 'idle' });
            setCopied(false);
          }}
          placeholder="github.com/you/your-prototype"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <button type="submit" disabled={!value.trim() || check.state === 'loading'} className={cn(buttonClasses({ variant: 'primary', size: 'md' }), square, 'flex-none')}>
          {check.state === 'loading' ? 'Checking…' : 'Add repo'}
        </button>
      </form>

      <div aria-live="polite">
        {check.state === 'error' && (
          <p className="mt-3 flex flex-wrap items-start gap-2 text-caption text-danger">
            <Warning size={14} aria-hidden className="mt-px flex-none" />
            {check.message}
          </p>
        )}
        {copied && !REGISTRY_REPO && (
          <p className="mt-3 text-caption text-muted">
            Added for you. The entry is copied: send it to the Flow Kit owners to put it on the central list.
          </p>
        )}
        {check.state === 'ready' && (
          <div className="mt-4 rounded-[10px] border border-line-strong bg-ink/[0.03] p-4">
            <div className="flex items-center gap-3">
              <img src={check.info.avatar} alt="" className="u-circle size-8 rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-ui font-medium">{check.info.full}</p>
                {check.info.description && <p className="truncate text-caption text-muted">{check.info.description}</p>}
              </div>
              <Visibility isPrivate={check.info.private} />
            </div>
            <ul className="mt-4 space-y-1.5 text-caption">
              <Requirement ok>
                {check.info.private ? 'Private: people will need access from the owner to open it' : 'Public: anyone can use it'}
              </Requirement>
              <Requirement ok={check.info.usesKit === true} warn={check.info.usesKit !== true}>
                {check.info.usesKit ? 'Built with @noon/flow-kit' : 'Couldn’t find @noon/flow-kit in package.json'}
              </Requirement>
              <Requirement ok={check.info.flows.length > 0} warn={!check.info.flows.length}>
                {check.info.flows.length ? `${check.info.flows.length} flows in src/flows` : 'No src/flows folder found'}
              </Requirement>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => share(check.info)} className={cn(buttonClasses({ variant: 'primary', size: 'sm' }), square)}>
                {REGISTRY_REPO ? 'Share with everyone' : 'Add and copy entry'}
              </button>
              <button type="button" onClick={() => setCheck({ state: 'idle' })} className={cn(buttonClasses({ variant: 'ghost', size: 'sm' }), square)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Requirement({ ok, warn, children }: { ok?: boolean; warn?: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('flex items-center gap-2', warn ? 'text-muted' : 'text-ink/85')}>
      {ok ? <CheckCircle size={14} weight="fill" className="text-[#38AE04]" aria-hidden /> : <Warning size={14} className="text-[#FF9741]" aria-hidden />}
      {children}
    </li>
  );
}

function Visibility({ isPrivate }: { isPrivate: boolean }) {
  return (
    <span className={cn(mono, 'u-circle flex flex-none items-center gap-1 rounded-full border px-2 py-0.5', isPrivate ? 'border-[#FF9741]/40 text-[#FF9741]' : 'border-line-strong text-muted')}>
      {isPrivate ? <LockSimple size={10} weight="bold" aria-hidden /> : <Globe size={10} weight="bold" aria-hidden />}
      {isPrivate ? 'Private' : 'Public'}
    </span>
  );
}

/* ------------------------------------------------------------- Repo card */

function RepoCard({ entry, pending, connected, onRemove }: { entry: Entry; pending: boolean; connected: boolean; onRemove?: () => void }) {
  const full = entry.repo;
  const [owner, name] = full.split('/');
  const [info, setInfo] = useState<RepoInfo | null>(null);
  const [error, setError] = useState<{ message: string; hidden: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const isPrivate = info?.private ?? Boolean(entry.private);
  // degit can't read private repos over HTTPS; a clone over SSH uses the person's own git login
  const command = isPrivate ? `git clone git@github.com:${full}.git` : `npx degit ${full} my-prototype`;

  useEffect(() => {
    const ctl = new AbortController();
    fetchRepo(full, ctl.signal)
      .then(setInfo)
      .catch((e: Error) => e.name !== 'AbortError' && setError({ message: e.message, hidden: e instanceof RepoHiddenError }));
    return () => ctl.abort();
  }, [full]);

  return (
    <article className="flex h-full flex-col gap-4 p-5 sm:p-6">
      <header className="flex items-center gap-3">
        {info ? (
          <img src={info.avatar} alt="" className="u-circle size-9 rounded-full" />
        ) : (
          <span className={cn('u-circle grid size-9 place-items-center rounded-full bg-ink/10 text-muted', !error && 'animate-pulse')}>
            {error && <GithubLogo size={16} aria-hidden />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption text-muted">{owner}</p>
          <p className="truncate text-ui font-medium">{name}</p>
        </div>
        <Visibility isPrivate={isPrivate} />
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${full}`} className="u-press grid size-7 place-items-center rounded-md text-muted hover:bg-ink/[0.06] hover:text-ink">
            <X size={13} aria-hidden />
          </button>
        )}
      </header>

      {error ? (
        error.hidden && isPrivate ? (
          <p className="flex items-start gap-2 text-caption leading-relaxed text-muted">
            <LockSimple size={14} aria-hidden className="mt-0.5 flex-none text-[#FF9741]" />
            <span>
              Private repo. Ask @{owner} for access{connected ? ', then make sure your token includes it.' : ', then connect GitHub above to see it here.'}
            </span>
          </p>
        ) : (
          <p className="flex items-start gap-2 text-caption text-muted">
            <Warning size={14} aria-hidden className="mt-px flex-none text-[#FF9741]" />
            {error.message}
          </p>
        )
      ) : info ? (
        <>
          <p className="line-clamp-2 min-h-[2lh] text-caption leading-relaxed text-muted">{info.description ?? 'No description.'}</p>
          {info.flows.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {info.flows.slice(0, 4).map((f) => (
                <li key={f} className="rounded-md border border-line px-1.5 py-0.5 font-mono text-micro text-ink/80">
                  {f}
                </li>
              ))}
              {info.flows.length > 4 && <li className="px-1 py-0.5 font-mono text-micro text-muted">+{info.flows.length - 4}</li>}
            </ul>
          )}
          <p className={cn(mono, 'flex items-center gap-3 text-muted')}>
            <span className="flex items-center gap-1">
              <Star size={11} weight="fill" aria-hidden />
              {info.stars}
            </span>
            <span>Updated {timeAgo(info.pushedAt)}</span>
            {pending && <span className="text-[#FEEE00]/90">Pending</span>}
          </p>
        </>
      ) : (
        <div className="space-y-2" aria-hidden>
          <div className="h-3 w-full animate-pulse rounded bg-ink/10" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" />
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          title={command}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* the command is in the tooltip */
            }
          }}
          className={cn(buttonClasses({ variant: 'primary', size: 'sm' }), square, 'flex-1')}
        >
          {copied ? <Check size={13} weight="bold" aria-hidden /> : <Copy size={13} aria-hidden />}
          {copied ? 'Copied' : 'Use this repo'}
        </button>
        <a href={`https://github.com/${full}`} target="_blank" rel="noreferrer" className={cn(buttonClasses({ variant: 'secondary', size: 'sm' }), square)}>
          GitHub
          <ArrowUpRight size={12} aria-hidden />
        </a>
      </div>
    </article>
  );
}
