import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteDraft, deleteSession, listDrafts, loadDraft, saveDraft, type DraftSummary } from './bridge';
import type { Editor, SavedChange } from './useEditor';

export interface Draft {
  id: string;
  title: string;
  flowId: string;
  /** the screen it was last on */
  route: string;
  changes: SavedChange[];
  createdAt: string;
  updatedAt: string;
}

const LAST_KEY = 'nk-studio-draft';
const remember = (id: string | null) => {
  try {
    if (id) localStorage.setItem(LAST_KEY, id);
    else localStorage.removeItem(LAST_KEY);
  } catch {
    /* storage blocked */
  }
};
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const stamp = (d: Date) => d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/**
 * Edit mode's drafts. A draft is one piece of work: a flow, the screen it's on,
 * its pending visual edits and (keyed by the same id) its chat. Drafts save to
 * .studio/drafts through the local bridge as you edit; resuming one navigates
 * back to its screen and re-applies its edits live.
 *
 * Every piece of editing lands in a draft: a draft is written the moment it
 * starts, edits autosave as they happen, an edit made with no draft open
 * creates one for the current flow, and a pending save is flushed if the tab
 * closes.
 */
export function useDrafts(editor: Editor, screen: () => Element | null, route: string, go: (route: string) => void, currentFlow?: { id: string; title: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [touched, setTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string>();
  // null = static deploy without the bridge: nothing can be saved
  const live = editor.bridge !== null;
  const latest = useRef<{ draft: Draft; dirty: boolean } | null>(null);
  const { serialize, restore, discard, reset, deferred, pending } = editor;
  const restoring = useRef(false);

  const refresh = useCallback(async () => setDrafts(await listDrafts()), []);
  useEffect(() => {
    if (live) refresh();
  }, [live, refresh]);

  const save = useCallback(
    async (d: Draft) => {
      setSaveState('saving');
      try {
        const res = await saveDraft(d.id, d);
        if (!res.ok) throw new Error();
        if (latest.current?.draft.id === d.id) latest.current.dirty = false;
        remember(d.id);
        setSaveState('saved');
        setSavedAt(d.updatedAt);
        refresh();
      } catch {
        setSaveState('error');
      }
    },
    [refresh],
  );

  /** Puts a draft's edits on screen, once its screen has rendered. */
  const apply = useCallback(
    (changes: SavedChange[]) => {
      restoring.current = true;
      setTimeout(() => {
        restore(changes, screen());
        restoring.current = false;
      }, 900);
    },
    [restore, screen],
  );

  const start = useCallback(
    (flowId: string, flowTitle: string, startRoute: string) => {
      discard(); // the previous draft is already saved; take its edits off screen
      reset();
      const now = new Date();
      const d: Draft = { id: `d-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, title: `${flowTitle} · ${stamp(now)}`, flowId, route: startRoute, changes: [], createdAt: now.toISOString(), updatedAt: now.toISOString() };
      setDraft(d);
      setTouched(true);
      save(d); // stored straight away, so it's in Drafts from the start
      return d;
    },
    [discard, reset, save],
  );

  const resume = useCallback(
    async (id: string) => {
      const d = await loadDraft<Draft>(id);
      if (!d) return null;
      discard();
      reset();
      setDraft(d);
      setTouched(true);
      setSaveState('saved');
      setSavedAt(d.updatedAt);
      remember(d.id);
      go(d.route);
      apply(d.changes);
      return d;
    },
    [discard, reset, go, apply],
  );

  const rename = useCallback((title: string) => setDraft((d) => (d ? { ...d, title: title || d.title } : d)), []);
  const touch = useCallback(() => setTouched(true), []);

  const remove = useCallback(
    async (id: string) => {
      await Promise.all([deleteDraft(id), deleteSession(id)]);
      if (draft?.id === id) {
        discard();
        reset();
        setDraft(null);
        remember(null);
      }
      refresh();
    },
    [draft?.id, discard, reset, refresh],
  );

  // Autosave: edits, screen and title, a moment after each change.
  const changes = serialize();
  const signature = JSON.stringify([changes.map((c) => (c.kind === 'asset' ? [c.target, c.name] : c)), route, draft?.title]);
  useEffect(() => {
    if (!draft || !live || restoring.current || !touched) return;
    const next = { ...draft, route: route.startsWith(`${draft.flowId}/`) ? route : draft.route, changes, updatedAt: new Date().toISOString() };
    latest.current = { draft: next, dirty: true };
    const t = setTimeout(() => {
      setDraft(next);
      save(next);
    }, 400);
    return () => clearTimeout(t);
  }, [signature, touched]); // eslint-disable-line react-hooks/exhaustive-deps

  // Editing with no draft open (e.g. after deleting the open one): start one for this flow.
  useEffect(() => {
    if (!draft && editor.enabled && live && changes.length && currentFlow) {
      const now = new Date();
      const d: Draft = { id: `d-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, title: `${currentFlow.title} · ${stamp(now)}`, flowId: currentFlow.id, route, changes, createdAt: now.toISOString(), updatedAt: now.toISOString() };
      setDraft(d);
      setTouched(true);
      save(d);
    }
  }, [changes.length, draft, editor.enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Closing or reloading the tab mid-save: send the last state anyway.
  useEffect(() => {
    const flush = () => {
      const l = latest.current;
      if (l?.dirty) saveDraft(l.draft.id, l.draft, true);
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  // Text and images that weren't on screen yet get another try on every screen change.
  useEffect(() => {
    if (!deferred.length) return;
    const t = setTimeout(() => restore(deferred, screen()), 900);
    return () => clearTimeout(t);
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  /** The draft to reopen when Edit mode starts (last one used), if it still exists. */
  const lastId = () => {
    try {
      return localStorage.getItem(LAST_KEY);
    } catch {
      return null;
    }
  };

  return { draft, drafts, start, resume, rename, remove, touch, refresh, lastId, pendingCount: pending.length, saveState, savedAt };
}
