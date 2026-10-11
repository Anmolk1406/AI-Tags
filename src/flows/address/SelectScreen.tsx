import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DottedDivider, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { icons, images } from './assets';
import { AddressToastHost, GradientTitle } from './components/primitives';
import {
  AddAddressButton,
  AddressCard,
  ListingEmpty,
  ListingHeader,
  ListingLoading,
  LocationNudge,
  SearchInput,
  SearchResultLoading,
  SearchResultsCard,
  SelectHeader,
  TabSwitcher,
} from './components/select';
import { addressTitle, places, singleLineAddress, t, type Place } from './data';
import { addressStore, useAddressStore } from './store';
import { addressMetrics } from './tokens';
import styles from './address.module.css';

export interface SelectParams {
  /** start on the Locker/ Pickup tab */
  tab?: number;
  /** demo: simulate denied location permission (shows the "Location not enabled" nudge) */
  locationDenied?: boolean;
  /** demo: show an AddressToastScreen message on mount */
  demoToast?: string;
  /** skip the initial skeleton */
  skipLoading?: boolean;
}

const TAB_PANE_WIDTH = 390;

/**
 * AddressV2SelectScreen (account entry: isBottomSheet false, doesChangeDefaultAddress true).
 * Header "Address Book", tab switcher, search field, add-new button, saved address cards.
 */
export function SelectScreen({ params }: ScreenProps<SelectParams>) {
  const nav = useNav();
  const addresses = useAddressStore((s) => s.addresses);
  const defaultId = useAddressStore((s) => s.defaultId);
  const loadingCode = useAddressStore((s) => s.loadingCode);
  const locationGranted = useAddressStore((s) => s.locationGranted);

  const [tab, setTab] = useState(params.tab ?? 0);
  const [isLoading, setIsLoading] = useState(!params.skipLoading);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // initial fetch (AddressService.getAddressesV2)
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (params.locationDenied) addressStore.setLocationGranted(false);
  }, [params.locationDenied]);

  useEffect(() => {
    if (!params.demoToast) return;
    const timer = setTimeout(() => addressStore.toast(params.demoToast!), 500);
    return () => clearTimeout(timer);
  }, [params.demoToast]);

  // debounce(500) autocomplete
  useEffect(() => {
    if (!query) {
      setDebounced('');
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    const timer = setTimeout(() => {
      setDebounced(query);
      setIsSearchLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // sortAddresses: selected address first (done on fetch only)
  const sortedRef = useRef<number[] | null>(null);
  if (sortedRef.current === null) sortedRef.current = [defaultId];
  const sorted = useMemo(() => {
    const first = sortedRef.current?.[0];
    const item = addresses.find((a) => a.id === first);
    return item ? [item, ...addresses.filter((a) => a.id !== first)] : addresses;
  }, [addresses]);

  const filtered = useMemo(() => {
    if (!query) return sorted;
    const q = query.toLowerCase();
    return sorted.filter((a) => `${singleLineAddress(a)} ${a.placeName} ${a.area} ${addressTitle(a)} ${a.nickname ?? ''}`.toLowerCase().includes(q));
  }, [sorted, query]);

  const searchResults = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    const hits = places.filter((p) => `${p.placeName} ${p.area}`.toLowerCase().includes(q));
    return hits.length ? hits : places.slice(0, 4).map((p) => ({ ...p }));
  }, [debounced]);

  const busy = !!loadingCode;

  const openMap = (params: Record<string, unknown>) => nav.push('address/map', params);

  const onAddressPress = (id: number, code: string) => {
    if (id === defaultId) {
      addressStore.toast(t.address_v2_selected_address_toast_message);
      return;
    }
    // setAddressAsDefault → AddressService.setDefaultAddressV2 → toast
    addressStore.setLoading(code);
    setTimeout(() => {
      addressStore.setDefault(id);
      addressStore.setLoading(null);
      addressStore.toast(t.address_v2_changed_default_address_toast_message);
    }, 700);
  };

  const onSearchResultPress = (place: Place) => openMap({ flow: 'create', placeId: place.id });

  const renderLatLngPane = () => {
    if (isLoading) return <ListingLoading />;
    const showEmpty = addresses.length === 0 && !query;
    return (
      <div className={`nk-scroll ${styles.pane}`}>
        <div className={styles.paneInner}>
          <SearchInput value={query} onChange={setQuery} disabled={busy} style={{ margin: '0 11px 6px' }} />
          <div className={styles.listContent}>
            {!query && (
              <ListingHeader>
                <AnimatePresence initial={false}>
                  {!locationGranted && (
                    <motion.div key="nudge" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                      <LocationNudge onEnable={() => addressStore.setLocationGranted(true)} />
                      <DottedDivider />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AddAddressButton text={t.address_v2_add_new_latlng_address} onPress={() => openMap({ flow: 'create', withLocationPrompt: true })} />
              </ListingHeader>
            )}
            {showEmpty ? (
              <ListingEmpty icon={images.emptyLatLng} title={t.address_v2_empty_latlng_saved_addresses_title} substring={t.address_v2_empty_latlng_saved_addresses_subtitle} />
            ) : (
              <>
                {query && <div style={{ height: 12 }} />}
                <AnimatePresence initial={false}>
                  {filtered.map((a, i) => (
                    <motion.div key={a.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                      <AddressCard
                        address={a}
                        isFirst={i === 0}
                        isSelected={a.id === defaultId}
                        isLoading={loadingCode === a.code}
                        disabled={busy}
                        onPress={() => onAddressPress(a.id, a.code)}
                        onThreeDots={() => nav.sheet('address/controls', { id: a.id })}
                        onShare={() => nav.toast('Opens the native share sheet with the address link')}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {query && isSearchLoading && (
                  <div>
                    <GradientTitle title={t.search_results} style={{ marginTop: filtered.length ? 10 : 0, paddingBottom: 10, marginLeft: 4 }} />
                    {[0, 1, 2].map((i) => (
                      <SearchResultLoading key={i} style={{ marginTop: 12 }} />
                    ))}
                  </div>
                )}
                {query && !isSearchLoading && searchResults.length > 0 && (
                  <div>
                    <GradientTitle title={t.search_results} style={{ marginTop: filtered.length ? 10 : 0, paddingBottom: 10, marginLeft: 4 }} />
                    <SearchResultsCard results={searchResults} onPress={onSearchResultPress} style={{ padding: 8 }} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCollectionPane = () => {
    if (isLoading) return <ListingLoading />;
    return (
      <div className={`nk-scroll ${styles.pane}`}>
        <div className={styles.paneInner}>
          <SearchInput value="" onChange={() => undefined} style={{ margin: '0 11px 6px' }} />
          <div className={styles.collectionHeader}>
            <ListingHeader>
              <AddAddressButton text={t.address_v2_add_new_collection_address} onPress={() => nav.toast('Collection-point map is not part of this prototype')} />
            </ListingHeader>
          </div>
          <ListingEmpty
            icon={images.emptyCollection}
            title={t.address_v2_empty_collection_saved_addresses_title}
            substrings={[
              { icon: icons.collectionEmpty1, text: t.address_v2_empty_collection_saved_addresses_subtitle1 },
              { icon: icons.collectionEmpty2, text: t.address_v2_empty_collection_saved_addresses_subtitle2 },
              { icon: icons.collectionEmpty3, text: t.address_v2_empty_collection_saved_addresses_subtitle3 },
            ]}
          />
        </div>
      </div>
    );
  };

  return (
    <Screen
      background="addrPage"
      header={
        <div className={styles.selectTop}>
          <SelectHeader title={t.address_v2_account_list_title} onBack={nav.back} />
          <div className={styles.tabSwitcherContainer}>
            <TabSwitcher tabs={[t.address_v2_latlng_tab_title, t.address_v2_collection_tab_title]} selected={tab} onPress={(i) => !isLoading && setTab(i)} tabWidth={addressMetrics.tabWidth} />
          </div>
        </div>
      }
      contentStyle={{ overflow: 'hidden', paddingBottom: 0 }}
    >
      <motion.div className={styles.slider} animate={{ x: -tab * TAB_PANE_WIDTH }} transition={{ duration: 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}>
        <div className={styles.tabContent}>{renderLatLngPane()}</div>
        <div className={styles.tabContent}>{renderCollectionPane()}</div>
      </motion.div>
      <AddressToastHost />
    </Screen>
  );
}
