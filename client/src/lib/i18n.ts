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
  
  // Landing page
  signIn: TranslationKey;
  getStarted: TranslationKey;
  heroTitle: TranslationKey;
  heroSubtitle: TranslationKey;
  learnMore: TranslationKey;
  secureTransactions: TranslationKey;
  secureTransactionsDesc: TranslationKey;
  purchaseProtection: TranslationKey;
  purchaseProtectionDesc: TranslationKey;
  mobileReady: TranslationKey;
  mobileReadyDesc: TranslationKey;
  multiplePaymentOptions: TranslationKey;
  multiplePaymentOptionsDesc: TranslationKey;
  globalReach: TranslationKey;
  globalReachDesc: TranslationKey;
  trustedCommunity: TranslationKey;
  trustedCommunityDesc: TranslationKey;
  footerText: TranslationKey;
  
  // Additional landing page features
  featuresTitle: TranslationKey;
  featuresSubtitle: TranslationKey;
  instantTransfers: TranslationKey;
  instantTransfersDesc: TranslationKey;
  secureProtection: TranslationKey;
  secureProtectionDesc: TranslationKey;
  mobileApp: TranslationKey;
  mobileAppDesc: TranslationKey;
  
  // Login page
  signInTitle: TranslationKey;
  welcomeBack: TranslationKey;
  username: TranslationKey;
  password: TranslationKey;
  enterUsername: TranslationKey;
  enterPassword: TranslationKey;
  loggingIn: TranslationKey;
  dontHaveAccount: TranslationKey;
  signUpHere: TranslationKey;
  returnToHome: TranslationKey;
  
  // Signup page
  signUpTitle: TranslationKey;
  createAccount: TranslationKey;
  firstName: TranslationKey;
  lastName: TranslationKey;
  email: TranslationKey;
  enterFirstName: TranslationKey;
  enterLastName: TranslationKey;
  enterEmail: TranslationKey;
  choosePassword: TranslationKey;
  creatingAccount: TranslationKey;
  alreadyHaveAccount: TranslationKey;

  // Dashboard specific
  'dashboard.welcome': TranslationKey;
  'dashboard.subtitle': TranslationKey;
  'dashboard.balance': TranslationKey;
  'dashboard.transactions': TranslationKey;
  'dashboard.paymentMethods': TranslationKey;
  'dashboard.sendMoney': TranslationKey;
  'dashboard.addMoney': TranslationKey;
  'dashboard.viewTransactions': TranslationKey;
  'dashboard.settings': TranslationKey;
  'dashboard.pendingRequests': TranslationKey;
  'dashboard.recentTransactions': TranslationKey;
  'dashboard.noTransactions': TranslationKey;
  'dashboard.sendFirstPayment': TranslationKey;
  'dashboard.noPaymentMethods': TranslationKey;
  'dashboard.addPaymentMethod': TranslationKey;
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
  },
  
  // Landing page
  signIn: {
    'en-GB': 'Sign In',
    'el-GR': 'Σύνδεση'
  },
  getStarted: {
    'en-GB': 'Get Started',
    'el-GR': 'Ξεκινήστε'
  },
  heroTitle: {
    'en-GB': 'Send, spend, and receive money your way',
    'el-GR': 'Στείλτε, ξοδέψτε και λάβετε χρήματα με τον δικό σας τρόπο'
  },
  heroSubtitle: {
    'en-GB': 'It\'s fast, free, and secure to send money to friends and family',
    'el-GR': 'Είναι γρήγορο, δωρεάν και ασφαλές να στέλνετε χρήματα σε φίλους και οικογένεια'
  },
  learnMore: {
    'en-GB': 'Learn More',
    'el-GR': 'Μάθετε Περισσότερα'
  },
  secureTransactions: {
    'en-GB': 'Secure Transactions',
    'el-GR': 'Ασφαλείς Συναλλαγές'
  },
  secureTransactionsDesc: {
    'en-GB': 'Advanced encryption protects your financial information',
    'el-GR': 'Προηγμένη κρυπτογράφηση προστατεύει τις οικονομικές σας πληροφορίες'
  },
  purchaseProtection: {
    'en-GB': 'Purchase Protection',
    'el-GR': 'Προστασία Αγορών'
  },
  purchaseProtectionDesc: {
    'en-GB': 'Shop with confidence knowing your eligible purchases are covered',
    'el-GR': 'Αγοράστε με εμπιστοσύνη γνωρίζοντας ότι οι επιλέξιμες αγορές σας καλύπτονται'
  },
  mobileReady: {
    'en-GB': 'Mobile Ready',
    'el-GR': 'Έτοιμο για Κινητά'
  },
  mobileReadyDesc: {
    'en-GB': 'Access your account anywhere with our mobile-optimized platform',
    'el-GR': 'Αποκτήστε πρόσβαση στον λογαριασμό σας οπουδήποτε με την πλατφόρμα μας που είναι βελτιστοποιημένη για κινητά'
  },
  multiplePaymentOptions: {
    'en-GB': 'Multiple Payment Options',
    'el-GR': 'Πολλαπλές Επιλογές Πληρωμής'
  },
  multiplePaymentOptionsDesc: {
    'en-GB': 'Link your bank account, credit card, or debit card',
    'el-GR': 'Συνδέστε τον τραπεζικό σας λογαριασμό, πιστωτική ή χρεωστική κάρτα'
  },
  globalReach: {
    'en-GB': 'Global Reach',
    'el-GR': 'Παγκόσμια Εμβέλεια'
  },
  globalReachDesc: {
    'en-GB': 'Send and receive money in multiple currencies worldwide',
    'el-GR': 'Στείλτε και λάβετε χρήματα σε πολλαπλά νομίσματα παγκοσμίως'
  },
  trustedCommunity: {
    'en-GB': 'Trusted Community',
    'el-GR': 'Αξιόπιστη Κοινότητα'
  },
  trustedCommunityDesc: {
    'en-GB': 'Join millions of users who trust us with their payments',
    'el-GR': 'Γίνετε μέλος των εκατομμυρίων χρηστών που μας εμπιστεύονται τις πληρωμές τους'
  },
  footerText: {
    'en-GB': '© 2025 WhoopsPay. An educational project developed as part of a postgraduate thesis on web application vulnerabilities.',
    'el-GR': '© 2025 WhoopsPay. Ένα εκπαιδευτικό έργο που αναπτύχθηκε στο πλαίσιο μεταπτυχιακής διπλωματικής για τρωτότητες εφαρμογών ιστού.'
  },
  
  // Login page translations
  signInTitle: {
    'en-GB': 'Sign In',
    'el-GR': 'Σύνδεση'
  },
  welcomeBack: {
    'en-GB': 'Welcome back',
    'el-GR': 'Καλώς ήρθατε πίσω'
  },
  username: {
    'en-GB': 'Username',
    'el-GR': 'Όνομα χρήστη'
  },
  password: {
    'en-GB': 'Password',
    'el-GR': 'Κωδικός πρόσβασης'
  },
  enterUsername: {
    'en-GB': 'Enter your username',
    'el-GR': 'Εισάγετε το όνομα χρήστη σας'
  },
  enterPassword: {
    'en-GB': 'Enter your password',
    'el-GR': 'Εισάγετε τον κωδικό πρόσβασης σας'
  },
  loggingIn: {
    'en-GB': 'Signing in...',
    'el-GR': 'Συνδέεστε...'
  },
  dontHaveAccount: {
    'en-GB': "Don't have an account?",
    'el-GR': 'Δεν έχετε λογαριασμό;'
  },
  signUpHere: {
    'en-GB': 'Sign up',
    'el-GR': 'Εγγραφή'
  },
  returnToHome: {
    'en-GB': 'Return to Home',
    'el-GR': 'Επιστροφή στην Αρχική'
  },
  
  // Signup page translations
  signUpTitle: {
    'en-GB': 'Create Account',
    'el-GR': 'Δημιουργία Λογαριασμού'
  },
  createAccount: {
    'en-GB': 'Create Account',
    'el-GR': 'Δημιουργία Λογαριασμού'
  },
  firstName: {
    'en-GB': 'First Name',
    'el-GR': 'Όνομα'
  },
  lastName: {
    'en-GB': 'Last Name',
    'el-GR': 'Επώνυμο'
  },
  email: {
    'en-GB': 'Email',
    'el-GR': 'Email'
  },
  enterFirstName: {
    'en-GB': 'Enter your first name',
    'el-GR': 'Εισάγετε το όνομά σας'
  },
  enterLastName: {
    'en-GB': 'Enter your last name',
    'el-GR': 'Εισάγετε το επώνυμό σας'
  },
  enterEmail: {
    'en-GB': 'Enter your email address',
    'el-GR': 'Εισάγετε τη διεύθυνση email σας'
  },
  choosePassword: {
    'en-GB': 'Choose a password',
    'el-GR': 'Επιλέξτε κωδικό πρόσβασης'
  },
  creatingAccount: {
    'en-GB': 'Creating account...',
    'el-GR': 'Δημιουργία λογαριασμού...'
  },
  alreadyHaveAccount: {
    'en-GB': 'Already have an account?',
    'el-GR': 'Έχετε ήδη λογαριασμό;'
  },
  
  // Additional landing page features
  featuresTitle: {
    'en-GB': 'Why Choose WhoopsPay?',
    'el-GR': 'Γιατί να επιλέξετε το WhoopsPay;'
  },
  featuresSubtitle: {
    'en-GB': 'Discover the features that make WhoopsPay the preferred choice for secure digital payments.',
    'el-GR': 'Ανακαλύψτε τα χαρακτηριστικά που κάνουν το WhoopsPay την προτιμώμενη επιλογή για ασφαλείς ψηφιακές πληρωμές.'
  },
  instantTransfers: {
    'en-GB': 'Instant Transfers',
    'el-GR': 'Άμεσες Μεταφορές'
  },
  instantTransfersDesc: {
    'en-GB': 'Send money instantly to friends and family with just a few clicks.',
    'el-GR': 'Στείλτε χρήματα άμεσα σε φίλους και οικογένεια με λίγα κλικ.'
  },
  secureProtection: {
    'en-GB': 'Secure Protection',
    'el-GR': 'Ασφαλής Προστασία'
  },
  secureProtectionDesc: {
    'en-GB': 'Bank-level security keeps your money and personal information safe.',
    'el-GR': 'Ασφάλεια επιπέδου τράπεζας διατηρεί τα χρήματα και τις προσωπικές σας πληροφορίες ασφαλείς.'
  },
  mobileApp: {
    'en-GB': 'Mobile App',
    'el-GR': 'Εφαρμογή Κινητού'
  },
  mobileAppDesc: {
    'en-GB': 'Manage your payments on the go with our intuitive mobile application.',
    'el-GR': 'Διαχειριστείτε τις πληρωμές σας εν κινήσει με τη διαισθητική μας εφαρμογή κινητού.'
  },

  // Dashboard specific translations
  'dashboard.welcome': {
    'en-GB': 'Welcome back, {firstName}!',
    'el-GR': 'Καλώς ήρθατε πίσω, {firstName}!'
  },
  'dashboard.subtitle': {
    'en-GB': 'Here\'s your account overview',
    'el-GR': 'Εδώ είναι η επισκόπηση του λογαριασμού σας'
  },
  'dashboard.balance': {
    'en-GB': 'Balance',
    'el-GR': 'Υπόλοιπο'
  },
  'dashboard.transactions': {
    'en-GB': 'Transactions',
    'el-GR': 'Συναλλαγές'
  },
  'dashboard.paymentMethods': {
    'en-GB': 'Payment Methods',
    'el-GR': 'Μέθοδοι Πληρωμής'
  },
  'dashboard.sendMoney': {
    'en-GB': 'Send Money',
    'el-GR': 'Αποστολή Χρημάτων'
  },
  'dashboard.addMoney': {
    'en-GB': 'Add Money',
    'el-GR': 'Προσθήκη Χρημάτων'
  },
  'dashboard.viewTransactions': {
    'en-GB': 'View All Transactions',
    'el-GR': 'Προβολή Όλων των Συναλλαγών'
  },
  'dashboard.settings': {
    'en-GB': 'Settings',
    'el-GR': 'Ρυθμίσεις'
  },
  'dashboard.pendingRequests': {
    'en-GB': 'Pending Requests',
    'el-GR': 'Αιτήματα σε Εκκρεμότητα'
  },
  'dashboard.recentTransactions': {
    'en-GB': 'Recent Transactions',
    'el-GR': 'Πρόσφατες Συναλλαγές'
  },
  'dashboard.noTransactions': {
    'en-GB': 'No transactions yet',
    'el-GR': 'Δεν υπάρχουν συναλλαγές ακόμα'
  },
  'dashboard.sendFirstPayment': {
    'en-GB': 'Send your first payment',
    'el-GR': 'Στείλτε την πρώτη σας πληρωμή'
  },
  'dashboard.noPaymentMethods': {
    'en-GB': 'No payment methods added',
    'el-GR': 'Δεν έχουν προστεθεί μέθοδοι πληρωμής'
  },
  'dashboard.addPaymentMethod': {
    'en-GB': 'Add Payment Method',
    'el-GR': 'Προσθήκη Μεθόδου Πληρωμής'
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
    const saved = localStorage.getItem('whoopspay-language');
    return (saved === 'en-GB' || saved === 'el-GR') ? (saved as Language) : 'en-GB';
  });

  // Persist language changes to localStorage
  useEffect(() => {
    localStorage.setItem('whoopspay-language', language);
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