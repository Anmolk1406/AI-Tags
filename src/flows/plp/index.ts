import { defineFlow } from '../../kit/registry';
import { FiltersSheet } from './FiltersSheet';
import { ListingScreen } from './ListingScreen';
import { SortSheet } from './SortSheet';
import { plpFlowTokens } from './tokens';

export const plpFlow = defineFlow({
  id: 'plp',
  title: 'Product listing (PLP)',
  group: 'Shopping',
  description: 'Search / category results: filter & sort pills with chip-reveal motion, skeleton → staggered card rise, filters + sort sheets that drive the grid.',
  initial: 'listing',
  tokens: plpFlowTokens,
  screens: [
    {
      id: 'listing',
      title: 'Listing',
      component: ListingScreen,
      defaultParams: { query: 'Best sellers' },
      notes: 'Pills drop in one by one (200ms + 50ms each). Cards load from skeletons with a 35ms stagger. Tap Sort → pick "Price: Low to High" to watch the grid reorder. Filter / facet pills open the Filters sheet; tap "express" to toggle inline.',
      source: 'src/screens/ListingScreen, marketplaces/noon/components/NoonCatalogList, NoonCatalogListNavPill, NoonProductBoxVertical, constants/NoonPLPLoadingMotion.ts',
    },
    {
      id: 'filters',
      title: 'Filters',
      component: FiltersSheet,
      presentation: 'sheet',
      notes: 'Draft-then-commit: the "Show N results" count updates live as you toggle options; Clear All resets the draft.',
      source: 'marketplaces/noon/screens/NoonFiltersScreenV2, components/NoonFiltersV2',
    },
    {
      id: 'sort',
      title: 'Sort',
      component: SortSheet,
      presentation: 'sheet',
      notes: 'Radio dot slides between rows (shared layout); selecting closes the sheet and reorders the PLP.',
      source: 'marketplaces/noon/components/NoonFiltersV2/FilterSortSection',
    },
  ],
});
