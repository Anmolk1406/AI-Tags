import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { easing, handoff } from '../../motion/presets';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import searchIcon from '../../assets/icons/noon-search-bar.webp';
import cameraIcon from '../../assets/icons/noon-search-bar-camera.webp';
import { searchBar as t } from '../../foundations/tokens';
import styles from './SearchBar.module.css';

/**
 * Home search pill (NoonSearchBarButton): 52h, r12, 1px #D7DAE3, 20px search-bar.webp, 24px search-bar-camera.webp.
 * `rotatingWords` reproduces the "Search <word>" vertical ticker (30px rows, ease-out-back); `rotatingPrefix` changes "Search".
 *
 * `variant="2025"` (opt-in, Homepage Revamp 2025, Figma iRE9RwO94eMAyW3j3XKNXW · 1337:6727): lighter 1px gray400 border,
 * 15/18 Medium placeholder in textProduct, 18 search icon 4 from the text, 12 gaps to a 24 divider and a 20 camera.
 * Pass the Figma artwork through `icons` (search / camera / divider); defaults are unchanged.
 */
export function SearchBarButton({
  onPress,
  placeholder = 'What are you looking for?',
  rotatingWords,
  rotatingPrefix = 'Search',
  camera = true,
  height = t.height,
  variant = 'default',
  icons,
}: {
  onPress?: () => void;
  placeholder?: string;
  rotatingWords?: string[];
  rotatingPrefix?: string;
  camera?: boolean;
  height?: number;
  variant?: 'default' | '2025';
  icons?: { search?: string; camera?: string; divider?: string };
}) {
  const v2025 = variant === '2025';
  const iconSize = v2025 ? 18 : t.iconSize;
  const cameraSize = v2025 ? 20 : t.cameraSize;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!rotatingWords?.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % rotatingWords.length), 2200);
    return () => clearInterval(t);
  }, [rotatingWords]);

  return (
    <Pressable className={`${styles.bar}${v2025 ? ` ${styles.v2025}` : ''}`} style={{ height }} onClick={onPress} scale={t.pressScale}>
      <span className={styles.lead}>
      <img src={icons?.search ?? searchIcon} alt="" width={iconSize} height={iconSize} />
      <span className={styles.placeholder}>
        {rotatingWords?.length ? (
          <>
            {rotatingPrefix}&nbsp;
            <span className={styles.ticker}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={i}
                  className={styles.word}
                  initial={{ y: t.tickerHeight, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -t.tickerHeight, opacity: 0 }}
                  transition={{ duration: 0.45, ease: easing.backOut }}
                >
                  {rotatingWords[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </>
        ) : (
          placeholder
        )}
      </span>
      </span>
      {camera && (
        <>
          {icons?.divider ? (
            <span className={styles.dividerArt}>
              <img src={icons.divider} alt="" width={24} height={1} />
            </span>
          ) : (
            <span className={styles.divider} />
          )}
          <img src={icons?.camera ?? cameraIcon} alt="" width={cameraSize} height={cameraSize} />
        </>
      )}
    </Pressable>
  );
}

/**
 * Editable search field (NoonSearchScreen): 52h, r12, 1px #DFDFDF, back icon inside.
 * `fill` plays the handoff "picked suggestion" fill: the text before `from` holds, the rest fades in on the
 * S-curve over 320ms (re-run it by changing `key`). `onFieldPress` makes the field a read-only button
 * (the PLP's search bar: tapping it goes back to editing) and keeps the camera instead of the clear (x).
 */
export function SearchInput({
  value,
  onChange,
  onBack,
  autoFocus,
  placeholder = 'What are you looking for?',
  right,
  onSubmit,
  onFieldPress,
  fill,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  right?: ReactNode;
  onSubmit?: (v: string) => void;
  onFieldPress?: () => void;
  fill?: { from: number; key: number };
}) {
  const [filling, setFilling] = useState(false);
  useEffect(() => {
    if (!fill || fill.from >= value.length) return;
    setFilling(true);
    const t = setTimeout(() => setFilling(false), 400); // 320ms fade + a frame of slack (also when the tab is in the background)
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill?.key]);
  const showClear = !!value && !onFieldPress;
  return (
    <div className={`${styles.bar} ${styles.input}`}>
      {onBack && (
        <Pressable onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>
          <Icon name="arrowLeft" size={t.iconSize} flipRtl />
        </Pressable>
      )}
      <span className={styles.fieldWrap}>
        <input
          className={styles.field}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          readOnly={!!onFieldPress}
          onClick={onFieldPress}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.(value)}
          style={filling ? { color: 'transparent' } : undefined}
        />
        {filling && fill && (
          <span className={styles.fillCopy} aria-hidden>
            <span>{value.slice(0, fill.from)}</span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.32, ease: handoff.easeInOut }}>
              {value.slice(fill.from)}
            </motion.span>
          </span>
        )}
      </span>
      {showClear ? (
        <Pressable onClick={() => onChange('')} aria-label="Clear" style={{ display: 'flex' }}>
          <Icon name="close" size={t.clearIconSize} color={t.fieldPlaceholder} />
        </Pressable>
      ) : (
        right ?? <Icon name="camera" size={t.iconSize} />
      )}
    </div>
  );
}
