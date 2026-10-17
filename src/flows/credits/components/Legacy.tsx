import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pressable, Spinner } from '../../../components';
import { creditsAssets as a } from '../assets';
import { t } from '../data';
import styles from '../bank.module.css';
import alert from './alert.module.css';

/** react-native-navigation top bar for HeaderTypes CLOSE (logo + "Cancel") and BACK (arrow + logo). */
export function NativeTopBar({ kind, onPress }: { kind: 'close' | 'back'; onPress: () => void }) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarRow}>
        {kind === 'back' && (
          <Pressable className={styles.topBarBack} scale={1} onClick={onPress} aria-label="Back">
            <img className={styles.flip} src={a.headerBack} width={24} height={24} alt="" />
          </Pressable>
        )}
        <img className={styles.topBarLogo} src={a.noonLogo} alt="noon" />
        {kind === 'close' && (
          <Pressable className={styles.topBarCancel} scale={1} onClick={onPress}>
            {t.cancel}
          </Pressable>
        )}
      </div>
    </div>
  );
}

/** src/components/PrimaryButton: h50, r0, #3866DF (disabled #ced1da), 14 bold white, white loader when busy. */
export function PrimaryButton({ children, onPress, disabled, loading, className }: { children: ReactNode; onPress?: () => void; disabled?: boolean; loading?: boolean; className?: string }) {
  return (
    <Pressable className={`${styles.primary} ${className ?? ''}`} scale={1} disabled={disabled || loading} onClick={onPress}>
      {loading ? <Spinner variant="ios" color="var(--nk-color-text-inverse)" /> : children}
    </Pressable>
  );
}

/** ThemeManager.icons.radioChecked / radioUnchecked (20×20) + label */
export function LegacyRadio({ checked, onPress, children }: { checked: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable className={styles.radioButton} scale={1} onClick={onPress} role="checkbox" aria-checked={checked}>
      <img src={checked ? a.radioChecked : a.radioUnchecked} alt="" />
      {children}
    </Pressable>
  );
}

export interface AlertSpec {
  title?: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'default' }[];
}

/**
 * Web stand-in for RN `Alert.alert` (the iOS UIAlertController the app shows for the delete confirmation and API
 * errors): dimmed page, a 270-wide frosted card, title / message, buttons side by side.
 */
export function NativeAlert({ spec, onClose }: { spec: AlertSpec | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {spec && (
        <motion.div className={alert.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <motion.div className={alert.card} role="alertdialog" initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className={alert.body}>
              {spec.title && <div className={alert.title}>{spec.title}</div>}
              <div className={alert.message}>{spec.message}</div>
            </div>
            <div className={alert.buttons}>
              {spec.buttons.map((b) => (
                <Pressable
                  key={b.text}
                  scale={1}
                  className={alert.button}
                  data-cancel={b.style === 'cancel' || undefined}
                  onClick={() => {
                    onClose();
                    b.onPress?.();
                  }}
                >
                  {b.text}
                </Pressable>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
