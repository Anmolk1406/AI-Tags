import { defineFlow } from '../../kit/registry';
import { HomeScreen } from './HomeScreen';
import { homeFlowTokens } from './tokens';

export const homeFlow = defineFlow({
  id: 'home',
  title: 'Home',
  group: 'Discovery',
  description: 'Home feed with address, rotating search, noon/Supermall toggle, hero, tiles, deals and recommendations.',
  initial: 'home',
  tokens: homeFlowTokens,
  tabBar: { tab: 'home', screens: ['home'] },
  screens: [
    {
      id: 'home',
      title: 'Home',
      component: HomeScreen,
      notes: 'Scroll down to collapse the address + toggle rows. Tap the switch for the Supermall header cross-fade. Tap "+" on a card for quick add-to-cart.',
      source: 'marketplaces/noon/screens/NoonHomeScreen, components/NoonHomeToggle*',
    },
  ],
});
