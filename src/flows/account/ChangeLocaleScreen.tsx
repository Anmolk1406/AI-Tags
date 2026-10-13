import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRef } from 'react';
import { useNav } from '../../kit/Navigator';
import languageToAr from '@assets/account/noon-account-language-change-ar.lottie';
import languageToEn from '@assets/account/noon-account-language-change-en.lottie';
import countryEn from '@assets/account/noon-account-country-change-en.lottie';
import { supportedCountries, type CountryCode, type LanguageId } from './data';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';

/**
 * Full-screen lottie (resizeMode cover, loop false) shown as a modal that fades in over 300ms.
 * On master `onAnimationFinish` calls I18n.setLanguage / I18n.setCountry, which restarts the app;
 * here it updates the flow store and closes the modal.
 */
function LocaleLottie({ src, onFinish }: { src: string; onFinish: () => void }) {
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onFinish();
  };
  return (
    <div className={styles.lottieScreen}>
      <DotLottieReact
        src={src}
        autoplay
        loop={false}
        layout={{ fit: 'cover', align: [0.5, 0.5] }}
        style={{ width: '100%', height: '100%' }}
        dotLottieRefCallback={(d) => {
          if (!d) return;
          d.addEventListener('complete', finish);
          d.addEventListener('loadError', finish);
        }}
      />
    </div>
  );
}

/** NoonAccountChangeLanguageAnimationScreen. Master picks the "-ar" file when the current UI is LTR (switching to Arabic). */
export function ChangeLanguageScreen() {
  const nav = useNav();
  const { language } = useAccountState();
  const target = (nav.params.language as LanguageId | undefined) ?? (language === 'en' ? 'ar' : 'en');
  return (
    <LocaleLottie
      src={language === 'en' ? languageToAr : languageToEn}
      onFinish={() => {
        setAccountState({ language: target });
        nav.back();
        nav.toast(target === 'ar' ? 'Language set to العربية — use the RTL toggle in the toolbar to preview' : 'Language set to English');
      }}
    />
  );
}

/** NoonAccountChangeCountryAnimationScreen (LTR uses the "-en" lottie). */
export function ChangeCountryScreen() {
  const nav = useNav();
  const target = (nav.params.country as CountryCode | undefined) ?? 'SA';
  return (
    <LocaleLottie
      src={countryEn}
      onFinish={() => {
        setAccountState({ country: target });
        nav.back();
        nav.toast(`Shopping in ${supportedCountries.find((c) => c.id === target)?.label ?? target}`);
      }}
    />
  );
}
