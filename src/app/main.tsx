import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Playground } from './Playground';
import { Landing } from './landing/Landing';
import 'lightweight-ui/fonts.css';
import './lui.css';
import './app.css';
import '../motion/custom';

/**
 * A page URL opens the studio — `/homepage`, `/plp?query=x`, `/checkout/cards-select` (see kit/routes.ts) or the
 * legacy `#/flow/screen`. `/` with no hash (or an in-page anchor like `#install`) is the landing page.
 */
const isStudio = () => /^#\/./.test(window.location.hash) || !/^\/(index\.html)?$/.test(window.location.pathname);

function App() {
  const [studio, setStudio] = useState(isStudio);
  useEffect(() => {
    const sync = () => {
      const next = isStudio();
      setStudio((prev) => {
        if (prev !== next) window.scrollTo(0, 0);
        return next;
      });
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  return studio ? <Playground /> : <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
