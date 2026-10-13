import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allFlows } from '../flows';
import { NoonPrototype } from '../kit/NoonPrototype';
import { createRegistry } from '../kit/registry';
import { parsePageUrl } from '../kit/routes';
import type { Route, StackEntry } from '../kit/types';
import '../motion/custom';
import './preview.css';

/**
 * Dev preview: the phone on its own. Every page is a URL — `/homepage`, `/plp?query=x`, `/orders` (see kit/routes.ts)
 * or the legacy `#/flow/screen`; `/` opens home. Not part of the package.
 */
const registry = createRegistry(allFlows);

// used by scripts/check-routes.mjs
(window as unknown as { __NK_ROUTES__: string[] }).__NK_ROUTES__ = registry.all().map((r) => r.route);

const readUrl = (): { route?: Route; params: Record<string, string> } => {
  const { route, params } = parsePageUrl(window.location);
  return { route: route ? registry.resolve(route)?.route : undefined, params };
};

function Preview() {
  const [page, setPage] = useState(() => ({ ...readUrl(), nonce: 0 }));

  useEffect(() => {
    const onUrl = () => setPage((p) => ({ ...readUrl(), nonce: p.nonce + 1 }));
    window.addEventListener('popstate', onUrl);
    window.addEventListener('hashchange', onUrl);
    return () => {
      window.removeEventListener('popstate', onUrl);
      window.removeEventListener('hashchange', onUrl);
    };
  }, []);

  // Keep the address bar on the page's clean URL, e.g. /homepage, /plp, /checkout/cards-select.
  const onRouteChange = useCallback((r: Route, s: StackEntry[]) => {
    const p = s.at(-1)?.params ?? {};
    // used by scripts/journeys.mjs: the current route and stack
    (window as unknown as { __NK_NAV__: unknown }).__NK_NAV__ = { route: r, stack: s.map((e) => e.route), params: p };
    const query = new URLSearchParams(Object.entries(p).flatMap(([k, v]) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? [[k, String(v)]] : []))).toString();
    window.history.replaceState(null, '', `/${registry.pathFor(r)}${query ? `?${query}` : ''}`);
  }, []);

  return (
    <div className="pg-stage">
      <NoonPrototype key={page.nonce} flows={allFlows} initialRoute={page.route} initialParams={page.params} onRouteChange={onRouteChange} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
