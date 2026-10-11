import { defineFlow } from '../../kit/registry';
import { ClassicHomeScreen } from './ClassicHomeScreen';
import { HomeScreen } from './HomeScreen';
import { homeFlowTokens } from './tokens';

export const homeFlow = defineFlow({
  id: 'home',
  title: 'Home',
  group: 'Discovery',
  description: 'Home feed (Homepage Revamp 2025): experience switcher, address, search, cashback ticker, hero, categories, tabbed recommendations, offers, rails, sponsored and launch modules.',
  initial: 'home',
  tokens: homeFlowTokens,
  tabBar: { tab: 'home', screens: ['home'] },
  screens: [
    {
      id: 'home',
      title: 'Home',
      component: HomeScreen,
      notes: 'Scroll past 100px to collapse the switcher and address row; the search bar stays. Tabs under "Recommended for you" swap the rail. Tap "+" on a card to quick-add, a tile or banner to open the listing.',
      source: 'Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102 (Homepage Revamp 2025)',
    },
    {
      id: 'classic',
      title: 'Home (classic)',
      component: ClassicHomeScreen,
      path: 'home-classic',
      notes: 'The previous home (bappzaar port): yellow header, Supermall toggle, CMS creatives. Kept for reference.',
      source: 'marketplaces/noon/screens/NoonHomeScreen, components/NoonHomeToggle*',
    },
  ],
});
