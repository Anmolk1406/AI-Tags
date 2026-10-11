/**
 * Read-only GitHub lookups for the community section, straight from the REST
 * API. Without a token GitHub allows ~60 requests an hour per visitor and only
 * public repos; with the visitor's own token (see `setToken`) it also reads the
 * private repos that person can access. Results are cached in sessionStorage.
 */

export interface RepoInfo {
  full: string;
  owner: string;
  name: string;
  avatar: string;
  description: string | null;
  stars: number;
  url: string;
  private: boolean;
  branch: string;
  pushedAt: string;
  /** folders under src/flows */
  flows: string[];
  /** depends on @noon/flow-kit (or is the kit itself); null when there's no package.json */
  usesKit: boolean | null;
}

const API = 'https://api.github.com';
const TTL = 30 * 60 * 1000;
const TOKEN_KEY = 'nk-gh-token';

/** The visitor's own GitHub token. Kept in this browser only, sent only to api.github.com. */
export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}
export function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    // cached answers were made with the old access; drop them
    for (const k of Object.keys(sessionStorage)) if (k.startsWith('nk-gh:')) sessionStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
}

/** Checks a token and returns the GitHub login it belongs to. */
export async function whoAmI(token: string): Promise<string> {
  const res = await fetch(`${API}/user`, { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error('GitHub didn’t accept that token. Check it was copied in full and hasn’t expired.');
  if (!res.ok) throw new Error(`GitHub answered ${res.status}. Try again.`);
  return (await res.json()).login;
}

/** `https://github.com/a/b`, `github.com/a/b.git`, `git@github.com:a/b.git` or `a/b` → `a/b`. */
export function parseRepo(input: string): string | null {
  const s = input.trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com[/:]([\w.-]+)\/([\w.-]+)/i) ?? s.match(/^git@github\.com:([\w.-]+)\/([\w.-]+)$/i) ?? s.match(/^([\w.-]+)\/([\w.-]+)$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

async function get(path: string, signal?: AbortSignal) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (res.status === 401) throw new Error('Your GitHub token was rejected. Reconnect GitHub with a fresh one.');
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub’s hourly limit for this browser is used up. Try again in a little while.');
  }
  return res;
}

export async function fetchRepo(full: string, signal?: AbortSignal): Promise<RepoInfo> {
  const key = `nk-gh:${getToken() ? 'auth' : 'anon'}:${full.toLowerCase()}`;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { at: number; info: RepoInfo } | null;
    if (hit && Date.now() - hit.at < TTL) return hit.info;
  } catch {
    /* storage unavailable: just fetch */
  }

  const res = await get(`/repos/${full}`, signal);
  if (res.status === 404) {
    // GitHub hides private repos behind a 404 for anyone without access
    throw new RepoHiddenError(
      getToken()
        ? 'Can’t see that repo. Check the name, and that your token includes it.'
        : 'Can’t see that repo. If it’s private, connect GitHub first.',
    );
  }
  if (!res.ok) throw new Error(`GitHub answered ${res.status}. Try again.`);
  const r = await res.json();
  const branch: string = r.default_branch;

  const [flowsRes, pkgRes] = await Promise.all([
    get(`/repos/${r.full_name}/contents/src/flows?ref=${branch}`, signal),
    get(`/repos/${r.full_name}/contents/package.json?ref=${branch}`, signal),
  ]);
  const flows: string[] = flowsRes.ok
    ? ((await flowsRes.json()) as { type: string; name: string }[]).filter((x) => x.type === 'dir').map((x) => x.name)
    : [];
  let usesKit: boolean | null = null;
  if (pkgRes.ok) {
    try {
      const pkg = JSON.parse(atob(((await pkgRes.json()) as { content: string }).content.replace(/\n/g, '')));
      usesKit = pkg.name === '@noon/flow-kit' || Boolean(pkg.dependencies?.['@noon/flow-kit'] ?? pkg.devDependencies?.['@noon/flow-kit']);
    } catch {
      usesKit = null;
    }
  }

  const info: RepoInfo = {
    full: r.full_name,
    owner: r.owner.login,
    name: r.name,
    avatar: r.owner.avatar_url,
    description: r.description,
    stars: r.stargazers_count,
    url: r.html_url,
    private: Boolean(r.private),
    branch,
    pushedAt: r.pushed_at,
    flows,
    usesKit,
  };
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), info }));
  } catch {
    /* storage full or blocked */
  }
  return info;
}

/** The repo doesn't exist, or it's private and this visitor can't see it. */
export class RepoHiddenError extends Error {
  name = 'RepoHiddenError';
}
