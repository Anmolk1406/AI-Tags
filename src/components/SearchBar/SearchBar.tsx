import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { easing } from '../../motion/presets';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import searchIcon from '../../assets/icons/noon-search-bar.webp';
import cameraIcon from '../../assets/icons/noon-search-bar-camera.webp';
import { searchBar as t } from '../../foundations/tokens';
import styles from './SearchBar.module.css';

/**
 * Home search pill (NoonSearchBarButton): 52h, r12, 1px #D7DAE3, 20px search-bar.webp, 24px search-bar-camera.webp.
 * `rotatingWords` reproduces the "Search <word>" vertical ticker (30px rows, ease-out-back).
 */
export function SearchBarButton({
  onPress,
  placeholder = 'What are you looking for?',
  rotatingWords,
  camera = true,
  height = t.height,
}: {
  onPress?: () => void;
  placeholder?: string;
  rotatingWords?: string[];
  camera?: boolean;
  height?: number;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!rotatingWords?.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % rotatingWords.length), 2200);
    return () => clearInterval(t);
  }, [rotatingWords]);

  return (
    <Pressable className={styles.bar} style={{ height }} onClick={onPress} scale={t.pressScale}>
      <img src={searchIcon} alt="" width={t.iconSize} height={t.iconSize} />
      <span className={styles.placeholder}>
        {rotatingWords?.length ? (
          <>
            Search&nbsp;
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
      {camera && (
        <>
          <span className={styles.divider} />
          <img src={cameraIcon} alt="" width={t.cameraSize} height={t.cameraSize} />
        </>
      )}
    </Pressable>
  );
}

/** Editable search field (NoonSearchScreen): 52h, r12, 1px #DFDFDF, back icon inside. */
export function SearchInput({
  value,
  onChange,
  onBack,
  autoFocus,
  placeholder = 'What are you looking for?',
  right,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  right?: ReactNode;
  onSubmit?: (v: string) => void;
}) {
  return (
    <div className={`${styles.bar} ${styles.input}`}>
      {onBack && (
        <Pressable onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>
          <Icon name="arrowLeft" size={t.iconSize} flipRtl />
        </Pressable>
      )}
      <input
        className={styles.field}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.(value)}
      />
      {value ? (
        <Pressable onClick={() => onChange('')} aria-label="Clear" style={{ display: 'flex' }}>
          <Icon name="close" size={t.clearIconSize} color={t.fieldPlaceholder} />
        </Pressable>
      ) : (
        right ?? <Icon name="camera" size={t.iconSize} />
      )}
    </div>
  );
}
