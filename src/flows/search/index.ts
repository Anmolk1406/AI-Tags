import { defineFlow } from '../../kit/registry';
import { SearchScreen } from './SearchScreen';
import { searchFlowTokens } from './tokens';

export const searchFlow = defineFlow({
  id: 'search',
  title: 'Search',
  group: 'Discovery',
  description: 'Search with presearch (recent searches, trending), live suggestions with staggered entry, and hand-off to the PLP.',
  initial: 'search',
  tokens: searchFlowTokens,
  screens: [
    {
      id: 'search',
      title: 'Search',
      component: SearchScreen,
      transition: 'push',
      notes: 'Type "air" to see suggestion rows stagger in with the match in bold. Tap Edit on Recent Searches for the wobble/delete mode. Enter or tap a row → PLP.',
      source: 'marketplaces/noon/screens/NoonSearchScreen, components/NoonSearchSuggestionRow, NoonRecentlySearchedModule',
    },
  ],
});
