/**
 * Internationalization (i18n) System - Multi-language support for WhoopsPay
 * 
 * Provides comprehensive internationalization capabilities supporting UK English
 * and Greek languages. Includes React context for global language state,
 * translation utilities, and localStorage persistence for user preferences.
 * 
 * Features:
 * - Type-safe translation keys with TypeScript support
 * - React Context API for global language state management
 * - Browser localStorage persistence for user language preferences
 * - Comprehensive translation coverage for all UI elements
 * - Fallback support to UK English for missing translations
 */
import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react';

/**
 * Supported Language Types - Available language options
 * 
 * Defines the available languages for the WhoopsPay application:
 * - 'en-GB': UK English (primary language)
 * - 'el-GR': Greek (secondary language for localization)
 */
export type Language = 'en-GB' | 'el-GR';

/**
 * Translation Key Structure - Bilingual string mapping
 * 
 * Defines the structure for translation entries, ensuring each
 * translatable string has versions in both supported languages.
 */
interface TranslationKey {
  'en-GB': string;
  'el-GR': string;
}

/**
 * Translation Schema - Complete mapping of all translatable strings
 * 
 * Comprehensive interface defining all translation keys used throughout
 * the WhoopsPay application. Organized by functional categories for
 * maintainability and easy reference.
 */
interface Translations {
  // Navigation
  dashboard: TranslationKey;
  transactions: TranslationKey;
  wallet: TranslationKey;
  profile: TranslationKey;
  settings: TranslationKey;
  admin: TranslationKey;
  
  // Common actions
  login: TranslationKey;
  logout: TranslationKey;
  submit: TranslationKey;
  cancel: TranslationKey;
  save: TranslationKey;
  edit: TranslationKey;
  delete: TranslationKey;
  approve: TranslationKey;
  reject: TranslationKey;
  
  // Money operations
  sendMoney: TranslationKey;
  requestMoney: TranslationKey;
  amount: TranslationKey;
  recipient: TranslationKey;
  description: TranslationKey;
  paymentMethod: TranslationKey;
  balance: TranslationKey;
  
  // Notifications
  notifications: TranslationKey;
  moneyRequest: TranslationKey;
  moneyReceived: TranslationKey;
  moneySent: TranslationKey;
  requestApproved: TranslationKey;
  requestRejected: TranslationKey;
  markAllRead: TranslationKey;
  clearAll: TranslationKey;
  
  // Transaction types
  transfer: TranslationKey;
  request: TranslationKey;
  completed: TranslationKey;
  pending: TranslationKey;
  rejected: TranslationKey;
  
  // Messages
  moneyRequestSent: TranslationKey;
  moneySentSuccessfully: TranslationKey;
  requestApprovedMessage: TranslationKey;
  requestRejectedMessage: TranslationKey;
  insufficientFunds: TranslationKey;
  userNotFound: TranslationKey;
  
  // Form validation
  required: TranslationKey;
  invalidAmount: TranslationKey;
  invalidEmail: TranslationKey;
  
  // Settings
  language: TranslationKey;
  changeLanguage: TranslationKey;
}

const translations: Translations = {
  // Navigation
  dashboard: {
    'en-GB': 'Dashboard',
    'el-GR': 'Πίνακας Ελέγχου'
  },
  transactions: {
    'en-GB': 'Transactions',
    'el-GR': 'Συναλλαγές'
  },
  wallet: {
    'en-GB': 'Wallet',
    'el-GR': 'Πορτοφόλι'
  },
  profile: {
    'en-GB': 'Profile',
    'el-GR': 'Προφίλ'
  },
  settings: {
    'en-GB': 'Settings',
    'el-GR': 'Ρυθμίσεις'
  },
  admin: {
    'en-GB': 'Admin',
    'el-GR': 'Διαχειριστής'
  },
  
  // Common actions
  login: {
    'en-GB': 'Log In',
    'el-GR': 'Σύνδεση'
  },
  logout: {
    'en-GB': 'Log Out',
    'el-GR': 'Αποσύνδεση'
  },
  submit: {
    'en-GB': 'Submit',
    'el-GR': 'Υποβολή'
  },
  cancel: {
    'en-GB': 'Cancel',
    'el-GR': 'Ακύρωση'
  },
  save: {
    'en-GB': 'Save',
    'el-GR': 'Αποθήκευση'
  },
  edit: {
    'en-GB': 'Edit',
    'el-GR': 'Επεξεργασία'
  },
  delete: {
    'en-GB': 'Delete',
    'el-GR': 'Διαγραφή'
  },
  approve: {
    'en-GB': 'Approve',
    'el-GR': 'Έγκριση'
  },
  reject: {
    'en-GB': 'Reject',
    'el-GR': 'Απόρριψη'
  },
  
  // Money operations
  sendMoney: {
    'en-GB': 'Send Money',
    'el-GR': 'Αποστολή Χρημάτων'
  },
  requestMoney: {
    'en-GB': 'Request Money',
    'el-GR': 'Αίτημα Χρημάτων'
  },
  amount: {
    'en-GB': 'Amount',
    'el-GR': 'Ποσό'
  },
  recipient: {
    'en-GB': 'Recipient',
    'el-GR': 'Παραλήπτης'
  },
  description: {
    'en-GB': 'Description',
    'el-GR': 'Περιγραφή'
  },
  paymentMethod: {
    'en-GB': 'Payment Method',
    'el-GR': 'Μέθοδος Πληρωμής'
  },
  balance: {
    'en-GB': 'Balance',
    'el-GR': 'Υπόλοιπο'
  },
  
  // Notifications
  notifications: {
    'en-GB': 'Notifications',
    'el-GR': 'Ειδοποιήσεις'
  },
  moneyRequest: {
    'en-GB': 'Money Request',
    'el-GR': 'Αίτημα Χρημάτων'
  },
  moneyReceived: {
    'en-GB': 'Money Received',
    'el-GR': 'Χρήματα Ελήφθησαν'
  },
  moneySent: {
    'en-GB': 'Money Sent',
    'el-GR': 'Χρήματα Εστάλησαν'
  },
  requestApproved: {
    'en-GB': 'Request Approved',
    'el-GR': 'Αίτημα Εγκρίθηκε'
  },
  requestRejected: {
    'en-GB': 'Request Rejected',
    'el-GR': 'Αίτημα Απορρίφθηκε'
  },
  markAllRead: {
    'en-GB': 'Mark All Read',
    'el-GR': 'Σήμανση Όλων ως Διαβασμένα'
  },
  clearAll: {
    'en-GB': 'Clear All',
    'el-GR': 'Εκκαθάριση Όλων'
  },
  
  // Transaction types
  transfer: {
    'en-GB': 'Transfer',
    'el-GR': 'Μεταφορά'
  },
  request: {
    'en-GB': 'Request',
    'el-GR': 'Αίτημα'
  },
  completed: {
    'en-GB': 'Completed',
    'el-GR': 'Ολοκληρώθηκε'
  },
  pending: {
    'en-GB': 'Pending',
    'el-GR': 'Εκκρεμεί'
  },
  rejected: {
    'en-GB': 'Rejected',
    'el-GR': 'Απορρίφθηκε'
  },
  
  // Messages
  moneyRequestSent: {
    'en-GB': 'Money request sent successfully!',
    'el-GR': 'Το αίτημα χρημάτων εστάλη επιτυχώς!'
  },
  moneySentSuccessfully: {
    'en-GB': 'Money sent successfully!',
    'el-GR': 'Τα χρήματα εστάλησαν επιτυχώς!'
  },
  requestApprovedMessage: {
    'en-GB': 'The money request has been approved and processed.',
    'el-GR': 'Το αίτημα χρημάτων εγκρίθηκε και επεξεργάστηκε.'
  },
  requestRejectedMessage: {
    'en-GB': 'The money request has been rejected.',
    'el-GR': 'Το αίτημα χρημάτων απορρίφθηκε.'
  },
  insufficientFunds: {
    'en-GB': 'Insufficient funds',
    'el-GR': 'Ανεπαρκή κεφάλαια'
  },
  userNotFound: {
    'en-GB': 'User not found',
    'el-GR': 'Δεν βρέθηκε χρήστης'
  },
  
  // Form validation
  required: {
    'en-GB': 'This field is required',
    'el-GR': 'Αυτό το πεδίο είναι υποχρεωτικό'
  },
  invalidAmount: {
    'en-GB': 'Please enter a valid amount',
    'el-GR': 'Παρακαλώ εισάγετε έγκυρο ποσό'
  },
  invalidEmail: {
    'en-GB': 'Please enter a valid email address',
    'el-GR': 'Παρακαλώ εισάγετε έγκυρη διεύθυνση email'
  },
  
  // Settings
  language: {
    'en-GB': 'Language',
    'el-GR': 'Γλώσσα'
  },
  changeLanguage: {
    'en-GB': 'Change Language',
    'el-GR': 'Αλλαγή Γλώσσας'
  }
};

/**
 * I18n Context Type - React context interface for language management
 * 
 * Defines the shape of the internationalization context providing:
 * - Current language state
 * - Language switching functionality  
 * - Translation function for retrieving localized strings
 */
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

/**
 * I18n React Context - Global language state container
 * 
 * Creates the React context for sharing internationalization state
 * across the entire component tree without prop drilling.
 */
const I18nContext = createContext<I18nContextType | null>(null);

/**
 * useI18n Hook - Access internationalization functionality
 * 
 * Custom React hook providing access to language state and translation
 * functions. Must be used within an I18nProvider component tree.
 * 
 * @returns Object containing current language, setLanguage function, and t() translator
 * @throws Error if used outside of I18nProvider
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { language, setLanguage, t } = useI18n();
 *   
 *   return (
 *     <div>
 *       <h1>{t('dashboard')}</h1>
 *       <button onClick={() => setLanguage('el-GR')}>
 *         Switch to Greek
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

/**
 * I18nProvider Component - Internationalization context provider
 * 
 * Root provider component that manages global language state and provides
 * translation functionality to all child components. Handles:
 * - Language state management with localStorage persistence
 * - Translation function with fallback support
 * - Context value distribution throughout component tree
 * 
 * Features:
 * - Automatic localStorage synchronization for user preferences
 * - Fallback to UK English for missing translations
 * - Type-safe translation key validation
 * 
 * @param children - React children to wrap with i18n context
 * 
 * @example
 * ```typescript
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  // Initialize language from localStorage with fallback to UK English
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('paypal-language');
    return (saved as Language) || 'en-GB';
  });

  // Persist language changes to localStorage
  useEffect(() => {
    localStorage.setItem('paypal-language', language);
  }, [language]);

  /**
   * Translation Function - Retrieve localized strings
   * 
   * Looks up translation keys in the current language with automatic
   * fallback to UK English for missing translations.
   * 
   * @param key - Translation key from the Translations interface
   * @returns Localized string in current language or UK English fallback
   */
  const t = (key: keyof Translations): string => {
    return translations[key][language] || translations[key]['en-GB'];
  };

  const value = { language, setLanguage, t };

  return createElement(I18nContext.Provider, { value }, children);
}