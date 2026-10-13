# PLP mapping

## PLP scroll states (bappzaar master e3eb49a2aae)

The noon PLP is `noon.DynamicLoaderScreen` → `NoonCatalogList`. Two independent scroll controllers run off the same list
scroll: the **bottom tab bar** (DynamicLoaderScreen's `BottomTabScrollVisibilityProvider` → native tab bar) and the
**hidable header** (`HidableView` around the fulfilment tabs + nav-pill row). The search bar sits outside `HidableView`
and never moves. Kit port: `src/flows/plp/scrollStates.ts` (`usePlpScrollStates`), values in `plpTokens.scroll`.

| bappzaar file | Behaviour | Value | Kit implementation |
|---|---|---|---|
| `src/utils/FeatureFlags.ts` `isAnimateBottomTabEnabled` (`animate_bottom_tab`, test 427) | gate 2: scroll-hide on | variant 1 = on (assumed live: it is the behaviour asked for; the flag is an ab-test kill-switch) | always on for `plp/listing` |
| `src/utils/BottomTabs/ScrollVisibilityProvider.ts` `scrollHideEnabledMarketplaces` | gate 1: immersive layout (content under the bar, paddingBottom = bar height) | noon, rocket | `.tabSpace` spacer at the end of the grid (already there) |
| ScrollVisibilityProvider `TOP_THRESHOLD` | y ≤ 10 → show | 10 | `plpTokens.scroll.tab.top` |
| ScrollVisibilityProvider `TAB_HIDE_ACTIVATION_OFFSET` | y < 150 → show (no hiding near the top) | 150 | `tab.activation` |
| ScrollVisibilityProvider `SCROLL_DEAD_ZONE` | \|Δy\| < 4 since the last counted event is ignored (lastY not advanced) | 4 | `tab.deadZone` |
| ScrollVisibilityProvider `TAB_HIDE_DISTANCE` | hide after 64 of continuous downward scroll | 64 | `tab.hideAfter` |
| ScrollVisibilityProvider `TAB_SHOW_DISTANCE` | show after 24 of continuous upward scroll | 24 | `tab.showAfter` |
| ScrollVisibilityProvider `_onScrollEnd` (iOS) | drag end with velocity.y > 2 pt/ms → hide; < −2 → show | ±2 pt/ms | `touchend` on the scroller: velocity from the last 60ms of scroll samples (px/ms) |
| ScrollVisibilityProvider `END_REACH_THRESHOLD` + `isOnReachEnd` | within 20 of the end: never hide; upward deltas (bounce) don't show (`autoShowOnReachEnd` off) | 20 | `tab.endReach` |
| ScrollVisibilityProvider `autoShowOnIdleEnabled` / `TAB_IDLE_SHOW_MS` | show after 1s idle | off (no caller sets it on master) | not ported (off) |
| ScrollVisibilityProvider `release()` via `navigationWrapper` push / tab switch | pushing a screen resets the provider; the bar is restored (unanimated) on the next appear | — | when the PLP stops being the top entry: reset, bar shown instantly |
| NoonCatalogList `onContentResetToTop` → DynamicLoaderScreen `reveal()` | filter / sort apply and back-to-top: bar shows | — | filter / sort change → scroll to top + `reveal()` |
| `node_modules/react-native-navigation/ios/UITabBarController+RNNOptions.mm` `hideTabBar` / `showTabBar` (via `ios/noon/BottomTabBarManager` `setTabBarHidden:animated:YES`) | tab bar frame slides off the bottom by its own height (incl. home-indicator inset) / back | 0.15s, `UIViewAnimationOptionCurveEaseOut` = cubic-bezier(0, 0, 0.58, 1) | `duration.fast` (0.15) + `plpTokens.scroll.tab.ease`; `--plp-tab-hide` 0 → 1 × (tab bar + inset) |
| `src/components/HidableView/HidableView.tsx` `onScroll` | direction from the previous event; hide when scrolling down, more than `height` past where the down run started, and y > height | height = measured header (initial 63 + 56 = 119, `FULFILLMENT_TABS_INITIAL_HEIGHT` + `CATALOG_NAV_PILLS_INITIAL_HEIGHT`) | `HidableHeader` in `scrollStates.ts`, height from a ResizeObserver |
| HidableView `onScroll` | show when scrolling up more than `height` from where the up run started, or y < height | same height | same |
| HidableView `onHide` / `onShow` | `Animated.timing` translateY 0 ↔ −height, native driver | 300ms, default easing `Easing.inOut(Easing.ease)` (ease = bezier(0.42, 0, 1, 1)) | `duration.medium` (0.3) + `plpTokens.scroll.header.ease` (the exact inOut(ease) function) |
| HidableView styles `header` | header layer absolute over the list, `overflow: hidden`, zIndex 2; the list gets `offsetTop` = header height | — | `.hidable` layer hangs under the search bar (`top: 100%`, overflow hidden); a spacer of the measured height opens the list |
| HidableView `componentDidUpdate` `dataChange` | new data (filter / sort apply) → header back in place with no animation | — | filter / sort change → `header.reset()` |
| NoonCatalogList `styles.searchContainer` | search bar block: white, shadow 0 1 4 black 0.1, zIndex 3 (above the header) — static, no scroll change | — | `.barBlock` (replaces the old `data-scrolled` shadow, which bappzaar doesn't have) |
| NoonCatalogList `styles.fulfillmentHeaderContainer` | white + `NoonStyles.shadow()` (1,1 black 0.04, RN default radius 3) — static | — | `.hidableInner` |
| NoonFulfillmentTabs, NoonCatalogListHeader | no scroll reaction of their own (no collapse, no subtitle change) | — | none |
| — | haptics | none on scroll | none |

The tab bar controller (`TabBarScrollVisibility`) now lives in `src/kit/tabBarScroll.ts` (`useTabBarScrollHide`, shared with the PDP); the PLP hook keeps using it with `plpTokens.scroll.tab`.
