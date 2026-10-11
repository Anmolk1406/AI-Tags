import { defineFlow } from '../../kit/registry';
import { AccountScreen } from './AccountScreen';
import { BirthdayPickerSheet } from './BirthdayPickerSheet';
import { ChangeCountryScreen, ChangeLanguageScreen } from './ChangeLocaleScreen';
import { ChangePasswordScreen } from './ChangePasswordScreen';
import { CountrySheet } from './CountrySheet';
import { DeletionScreen } from './DeletionScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { DeletionReasonSheet, NationalitySheet } from './ListSheets';
import { ManageDevicesScreen } from './ManageDevicesScreen';
import { NotificationsSheet } from './NotificationsSheet';
import { PoliciesSheet } from './PoliciesSheet';
import { PreferencesSheet } from './PreferencesSheet';
import { SecuritySheet } from './SecuritySheet';
import { SignedOutScreen } from './SignedOutScreen';
import { SignOutSheet } from './SignOutSheet';
import { accountFlowTokens } from './tokens';

const NA = 'marketplaces/noon/components/NoonAccount';
const SHEET = 'in noon.NoonAccountBottomSheetScreen (AddressV2FloatingOverlay)';

export const accountFlow = defineFlow({
  id: 'account',
  title: 'Account',
  group: 'Profile',
  description:
    'Signed-in account hub and every inner screen behind it: edit profile, account security (manage devices, change password, deletion), notifications, preferences, policies, country + language switching, sign-out, plus the signed-out state.',
  initial: 'account',
  tokens: accountFlowTokens,
  tabBar: { tab: 'account', screens: ['account', 'signedOut'] },
  screens: [
    {
      id: 'account',
      title: 'Account',
      component: AccountScreen,
      notes:
        'Every row navigates: profile card / edit ring → Edit profile; Addresses (modal) / Manage cards / Returns go to other flows; Warranty claims toasts. Language uses the inline switcher (slider 250ms → change-language lottie). Country, Preferences, Notifications, Account security, Sign out and the footer "Policies" open floating bottom sheets.',
      source: 'marketplaces/noon/screens/NoonAccountScreen, NoonAccountSignedInState, NoonAccountSections/*, NoonAccountFooter',
    },
    {
      id: 'signedOut',
      title: 'Signed out',
      component: SignedOutScreen,
      notes: 'Hero frames auto-advance and can be swiped; dots animate width (250ms). "Login/Sign up" simulates login and returns to the signed-in account.',
      source: `${NA}/NoonAccountSignedOutState`,
    },
    {
      id: 'editProfile',
      title: 'Edit profile',
      component: EditProfileScreen,
      notes:
        'Type in the name fields (floating labels; clearing one shows the required error). Pick gender / tourist / nationality / diet — Save turns dark once dirty and recomputes the % badge. Birthday opens the date wheel sheet; View all opens the nationality list.',
      source: `marketplaces/noon/screens/NoonAccountScreen/NoonAccountEditProfileScreen, ${NA}/NoonAccountEditProfile/*`,
    },
    {
      id: 'birthday',
      title: 'Birthday picker',
      component: BirthdayPickerSheet,
      presentation: 'sheet',
      notes: 'Scroll the day / month / year wheels (future dates are greyed). DONE writes the date into the edit-profile form.',
      source: `src/screens/DatePickerScreen + ${NA}/NoonAccountEditProfile/NoonAccountBirthdayPickerContent`,
    },
    {
      id: 'nationality',
      title: 'Nationality list',
      component: NationalitySheet,
      presentation: 'sheet',
      notes: 'Pick any nationality; if it is not one of the 4 quick tiles it replaces the 4th tile on Edit profile.',
      source: 'stand-in for noon.PersonalizedExperienceNationalityListingScreen',
    },
    {
      id: 'security',
      title: 'Account security',
      component: SecuritySheet,
      presentation: 'sheet',
      notes: 'Skeleton loader (3 rows) while biometrics are checked, then Edit Password → Change password, Manage devices, Account deletion (modal).',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountSecuritySettings (+ Loader) ${SHEET}`,
    },
    {
      id: 'manageDevices',
      title: 'Manage devices',
      component: ManageDevicesScreen,
      notes: 'Sign out of a device → confirmation sheet → the row fades out and the list re-flows. "Sign out of all other devices" clears the list and shows the empty state.',
      source: `marketplaces/noon/screens/NoonAccountScreen/NoonAccountSecuritySettingsManageAllDevicesScreen, ${NA}/NoonAccountInnerScreenContent/NoonAccountSecuritySettings/{NoonSecurityScreenHeader,NoonSecurityManageDevicesSection}`,
    },
    {
      id: 'changePassword',
      title: 'Change password',
      component: ChangePasswordScreen,
      notes: 'Type a new password and watch the requirement checklist turn on. SUBMIT validates (required / invalid / mismatch) and returns with a toast.',
      source: 'features/auth/login/screens/PasswordEditScreen (noon.PasswordEditScreen)',
    },
    {
      id: 'deletion',
      title: 'Account deletion',
      component: DeletionScreen,
      presentation: 'modal',
      notes: 'Pick a reason (sheet) and tick the agreement to enable DELETE YOUR ACCOUNT, which signs out.',
      source: 'marketplaces/noon/screens/NoonAccountDeletionScreen',
    },
    {
      id: 'deletionReason',
      title: 'Deletion reason',
      component: DeletionReasonSheet,
      presentation: 'sheet',
      notes: 'Reason list for the deletion screen.',
      source: 'stand-in for noon.ListingOverlayScreen',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      component: NotificationsSheet,
      presentation: 'sheet',
      notes: 'Loader, then push card (Open settings), language tab switcher (spring indicator) and marketing switches. Save persists them and closes.',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountNotificationsSettings ${SHEET}`,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: PreferencesSheet,
      presentation: 'sheet',
      notes: 'Toggle haptics. Clear cache fades the list out and springs in the confirmation (header from top, buttons from bottom); Yes shows a spinner then closes.',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountPreferences (+ NoonAccountClearCacheConfirmation) ${SHEET}`,
    },
    {
      id: 'policies',
      title: 'Policies',
      component: PoliciesSheet,
      presentation: 'sheet',
      notes: 'Legal / Orders & Returns / Support. Rows close the sheet and toast the web-view target. Warranty policy only shows for SA / AE / EG.',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountPolicies ${SHEET}`,
    },
    {
      id: 'country',
      title: 'Country selector',
      component: CountrySheet,
      presentation: 'sheet',
      notes: 'Pick another country → sheet closes → full-screen change-country lottie → flag on the Country row updates.',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountCountrySelector ${SHEET}`,
    },
    {
      id: 'changeCountry',
      title: 'Change country',
      component: ChangeCountryScreen,
      presentation: 'modal',
      transition: 'fade',
      defaultParams: { country: 'SA' },
      notes: 'Full-screen lottie that fades in (300ms) and closes itself when it finishes.',
      source: 'marketplaces/noon/screens/NoonAccountScreen/NoonAccountChangeCountryAnimationScreen',
    },
    {
      id: 'changeLanguage',
      title: 'Change language',
      component: ChangeLanguageScreen,
      presentation: 'modal',
      transition: 'fade',
      defaultParams: { language: 'ar' },
      notes: 'Full-screen lottie opened by the Language switcher; closes itself when finished.',
      source: 'marketplaces/noon/screens/NoonAccountScreen/NoonAccountChangeLanguageAnimationScreen',
    },
    {
      id: 'signOut',
      title: 'Sign out',
      component: SignOutSheet,
      presentation: 'sheet',
      notes: 'Floating sheet; tap the scrim to dismiss. "Yes, sign out" resets to the signed-out screen. Manage devices reuses it with its own title / description.',
      source: `${NA}/NoonAccountInnerScreenContent/NoonAccountSignOutConfirmation ${SHEET}`,
    },
  ],
});
