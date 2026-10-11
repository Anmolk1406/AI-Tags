import { motion } from 'motion/react';
import { Pressable, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import { currency, formatPrice, user } from '../../mocks/products';
import { AccountFooter } from './components/AccountFooter';
import { ActionCards } from './components/ActionCards';
import { AccountSectionItem } from './components/AccountSection';
import { CountryRow, LanguageRow, MenuGroup } from './components/MenuGroup';
import { ProfileCard } from './components/ProfileCard';
import { accountSection, securitySection, settingsSection } from './data';
import { AccountIconImg } from './icons';
import styles from './account.module.css';

const enter = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, mass: 1, damping: 15, stiffness: 120, delay: 0.05 * i },
});

/**
 * Signed-in Account (NoonAccountScreen → NoonAccountSignedInState).
 * Page #F2F3F7, sections 12 apart, edgeSpacing 15.
 */
export function AccountScreen() {
  const nav = useNav();
  return (
    <Screen background="bgPage" withTabBar safeTop={false}>
      <div className={styles.statusCover} />
      <div className={styles.page}>
        <motion.div {...enter(0)}>
          <ProfileCard />
        </motion.div>
        <motion.div {...enter(1)}>
          <ActionCards />
        </motion.div>
        <motion.div {...enter(2)}>
          <Pressable className={styles.creditsRow} scale={0.98} onClick={() => nav.toast('noon Credits')}>
            <AccountIconImg name="credits" size={20} />
            <span className={styles.creditsLabel}>noon Credits</span>
            <span className={styles.creditsPill}>
              <span>
                {currency} {formatPrice(user.credits)}
              </span>
              <AccountIconImg name="chevron" size={12} />
            </span>
          </Pressable>
        </motion.div>
        <motion.div {...enter(3)}>
          <MenuGroup items={accountSection} extra={[<LanguageRow key="lang" />, <CountryRow key="country" />]} />
        </motion.div>
        <motion.div {...enter(4)}>
          <MenuGroup items={settingsSection} />
        </motion.div>
        <motion.div {...enter(5)}>
          <MenuGroup
            items={securitySection}
            extra={[<AccountSectionItem key="signout" before={<AccountIconImg name="signOut" size={20} />} title="Sign out" onPress={() => nav.sheet('account/signOut')} />]}
          />
        </motion.div>
        <motion.div {...enter(6)}>
          <AccountFooter />
        </motion.div>
      </div>
    </Screen>
  );
}
