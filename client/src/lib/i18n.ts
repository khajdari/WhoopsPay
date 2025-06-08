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
  
  // Dashboard specific translations
  dashboardWelcome: TranslationKey;
  dashboardSubtitle: TranslationKey;
  dashboardBalance: TranslationKey;
  dashboardTransactions: TranslationKey;
  dashboardPaymentMethods: TranslationKey;
  dashboardSendMoney: TranslationKey;
  dashboardAddMoney: TranslationKey;
  dashboardViewTransactions: TranslationKey;
  dashboardSettings: TranslationKey;
  dashboardPendingRequests: TranslationKey;
  dashboardRecentTransactions: TranslationKey;
  dashboardNoTransactions: TranslationKey;
  dashboardSendFirstPayment: TranslationKey;
  dashboardNoPaymentMethods: TranslationKey;
  dashboardAddPaymentMethod: TranslationKey;
  
  // Transfer specific translations
  transferTitle: TranslationKey;
  transferSubtitle: TranslationKey;
  transferRecipientEmail: TranslationKey;
  transferAmount: TranslationKey;
  transferDescription: TranslationKey;
  transferPaymentMethod: TranslationKey;
  transferReviewTitle: TranslationKey;
  transferConfirmTitle: TranslationKey;
  transferCompleteTitle: TranslationKey;
  transferSuccessMessage: TranslationKey;
  transferSendAnother: TranslationKey;
  transferGoToDashboard: TranslationKey;
  transferAvailableBalance: TranslationKey;
  transferRecentTransfers: TranslationKey;
  
  // Issues/Support translations
  issuesTitle: TranslationKey;
  issuesSubtitle: TranslationKey;
  issuesReportTitle: TranslationKey;
  issuesReportIssue: TranslationKey;
  issuesTitle2: TranslationKey;
  issuesCategory: TranslationKey;
  issuesPriority: TranslationKey;
  issuesDescription2: TranslationKey;
  issuesSubmitIssue: TranslationKey;
  issuesNoIssuesFound: TranslationKey;
  issuesStartReporting: TranslationKey;
  issuesSearch: TranslationKey;
  issuesAllStatuses: TranslationKey;
  issuesAllCategories: TranslationKey;
  issuesAllPriorities: TranslationKey;
  issuesFilters: TranslationKey;
  issuesStatus: TranslationKey;
  issuesOpen: TranslationKey;
  issuesInProgress: TranslationKey;
  issuesResolved: TranslationKey;
  issuesClosed: TranslationKey;
  issuesLow: TranslationKey;
  issuesMedium: TranslationKey;
  issuesHigh: TranslationKey;
  issuesUrgent: TranslationKey;
  
  // Admin translations
  adminTitle: TranslationKey;
  adminSubtitle: TranslationKey;
  adminOverview: TranslationKey;
  adminUsers: TranslationKey;
  adminTransactions2: TranslationKey;
  adminSystemHealth: TranslationKey;
  adminActiveUsers: TranslationKey;
  adminTotalVolume: TranslationKey;
  adminPendingIssues: TranslationKey;
  adminRecentActivity: TranslationKey;
  adminSystemAlerts: TranslationKey;
  adminManageUsers: TranslationKey;
  adminViewTransactions: TranslationKey;
  adminIssueManagement: TranslationKey;
  adminSystemSettings: TranslationKey;
  
  // Profile translations
  profileTitle: TranslationKey;
  profileSubtitle: TranslationKey;
  profilePersonalInfo: TranslationKey;
  profileSecuritySettings: TranslationKey;
  profilePreferences: TranslationKey;
  profileActivityLog: TranslationKey;
  profileChangePassword: TranslationKey;
  profileTwoFactor: TranslationKey;
  profileNotificationSettings: TranslationKey;
  profilePrivacySettings: TranslationKey;
  
  // Wallet translations
  walletTitle: TranslationKey;
  walletSubtitle: TranslationKey;
  walletBalance: TranslationKey;
  walletAddFunds: TranslationKey;
  walletWithdraw: TranslationKey;
  walletPaymentMethods: TranslationKey;
  walletAddPaymentMethod: TranslationKey;
  walletTransactionHistory: TranslationKey;
  
  // Authentication translations
  authWelcome: TranslationKey;
  authSecureLogin: TranslationKey;
  authQuickAccess: TranslationKey;
  authLoginAsUser: TranslationKey;
  authLoginAsAdmin: TranslationKey;
  authCreateAccount2: TranslationKey;
  authForgotPassword: TranslationKey;
  authResetPassword: TranslationKey;
  authSignUpHere2: TranslationKey;
  authSignInHere: TranslationKey;
  authRememberPassword: TranslationKey;
  authDontHaveAccount2: TranslationKey;
  authAlreadyHaveAccount2: TranslationKey;
  authProcessing: TranslationKey;
  authSendResetLink: TranslationKey;
  authBackToEdit: TranslationKey;
  authClearForm: TranslationKey;
  authReviewTransfer: TranslationKey;
  
  // Common UI elements
  loading: TranslationKey;
  refresh: TranslationKey;
  search: TranslationKey;
  filter: TranslationKey;
  sort: TranslationKey;
  export: TranslationKey;
  view: TranslationKey;
  manage: TranslationKey;
  update: TranslationKey;
  create: TranslationKey;
  close: TranslationKey;
  confirm: TranslationKey;
  continue: TranslationKey;
  back: TranslationKey;
  next: TranslationKey;
  previous: TranslationKey;
  yes: TranslationKey;
  no: TranslationKey;
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
  
  // Dashboard specific translations
  dashboardWelcome: {
    'en-GB': 'Welcome back',
    'el-GR': 'Καλώς ήρθατε πίσω'
  },
  dashboardSubtitle: {
    'en-GB': 'Here\'s what\'s happening with your account',
    'el-GR': 'Δείτε τι συμβαίνει με τον λογαριασμό σας'
  },
  dashboardBalance: {
    'en-GB': 'Current Balance',
    'el-GR': 'Τρέχον Υπόλοιπο'
  },
  dashboardTransactions: {
    'en-GB': 'Recent Transactions',
    'el-GR': 'Πρόσφατες Συναλλαγές'
  },
  dashboardPaymentMethods: {
    'en-GB': 'Payment Methods',
    'el-GR': 'Μέθοδοι Πληρωμής'
  },
  dashboardSendMoney: {
    'en-GB': 'Send Money',
    'el-GR': 'Αποστολή Χρημάτων'
  },
  dashboardAddMoney: {
    'en-GB': 'Add Money',
    'el-GR': 'Προσθήκη Χρημάτων'
  },
  dashboardViewTransactions: {
    'en-GB': 'View All Transactions',
    'el-GR': 'Προβολή Όλων των Συναλλαγών'
  },
  dashboardSettings: {
    'en-GB': 'Account Settings',
    'el-GR': 'Ρυθμίσεις Λογαριασμού'
  },
  dashboardPendingRequests: {
    'en-GB': 'Pending Requests',
    'el-GR': 'Αιτήματα σε Εκκρεμότητα'
  },
  dashboardRecentTransactions: {
    'en-GB': 'Recent Transactions',
    'el-GR': 'Πρόσφατες Συναλλαγές'
  },
  dashboardNoTransactions: {
    'en-GB': 'No transactions yet',
    'el-GR': 'Δεν υπάρχουν συναλλαγές ακόμα'
  },
  dashboardSendFirstPayment: {
    'en-GB': 'Send your first payment',
    'el-GR': 'Στείλτε την πρώτη σας πληρωμή'
  },
  dashboardNoPaymentMethods: {
    'en-GB': 'No payment methods added',
    'el-GR': 'Δεν έχουν προστεθεί μέθοδοι πληρωμής'
  },
  dashboardAddPaymentMethod: {
    'en-GB': 'Add Payment Method',
    'el-GR': 'Προσθήκη Μεθόδου Πληρωμής'
  },
  
  // Transfer specific translations
  transferTitle: {
    'en-GB': 'Send Money',
    'el-GR': 'Αποστολή Χρημάτων'
  },
  transferSubtitle: {
    'en-GB': 'Transfer funds securely to other users',
    'el-GR': 'Μεταφέρετε κεφάλαια με ασφάλεια σε άλλους χρήστες'
  },
  transferRecipientEmail: {
    'en-GB': 'Recipient Email',
    'el-GR': 'Email Παραλήπτη'
  },
  transferAmount: {
    'en-GB': 'Amount',
    'el-GR': 'Ποσό'
  },
  transferDescription: {
    'en-GB': 'Description (Optional)',
    'el-GR': 'Περιγραφή (Προαιρετικό)'
  },
  transferPaymentMethod: {
    'en-GB': 'Payment Method',
    'el-GR': 'Μέθοδος Πληρωμής'
  },
  transferReviewTitle: {
    'en-GB': 'Review Transfer',
    'el-GR': 'Έλεγχος Μεταφοράς'
  },
  transferConfirmTitle: {
    'en-GB': 'Confirm Transfer',
    'el-GR': 'Επιβεβαίωση Μεταφοράς'
  },
  transferCompleteTitle: {
    'en-GB': 'Transfer Complete!',
    'el-GR': 'Η Μεταφορά Ολοκληρώθηκε!'
  },
  transferSuccessMessage: {
    'en-GB': 'Your money has been sent successfully',
    'el-GR': 'Τα χρήματά σας εστάλησαν επιτυχώς'
  },
  transferSendAnother: {
    'en-GB': 'Send Another',
    'el-GR': 'Αποστολή Άλλης'
  },
  transferGoToDashboard: {
    'en-GB': 'Go to Dashboard',
    'el-GR': 'Μετάβαση στον Πίνακα Ελέγχου'
  },
  transferAvailableBalance: {
    'en-GB': 'Available Balance',
    'el-GR': 'Διαθέσιμο Υπόλοιπο'
  },
  transferRecentTransfers: {
    'en-GB': 'Recent Transfers',
    'el-GR': 'Πρόσφατες Μεταφορές'
  },
  
  // Issues/Support translations
  issuesTitle: {
    'en-GB': 'Support Issues',
    'el-GR': 'Ζητήματα Υποστήριξης'
  },
  issuesSubtitle: {
    'en-GB': 'Report issues and track their resolution status',
    'el-GR': 'Αναφέρετε προβλήματα και παρακολουθήστε την κατάσταση επίλυσής τους'
  },
  issuesReportTitle: {
    'en-GB': 'Report New Issue',
    'el-GR': 'Αναφορά Νέου Προβλήματος'
  },
  issuesReportIssue: {
    'en-GB': 'Report Issue',
    'el-GR': 'Αναφορά Προβλήματος'
  },
  issuesTitle2: {
    'en-GB': 'Issue Title',
    'el-GR': 'Τίτλος Προβλήματος'
  },
  issuesCategory: {
    'en-GB': 'Category',
    'el-GR': 'Κατηγορία'
  },
  issuesPriority: {
    'en-GB': 'Priority',
    'el-GR': 'Προτεραιότητα'
  },
  issuesDescription2: {
    'en-GB': 'Detailed Description',
    'el-GR': 'Λεπτομερής Περιγραφή'
  },
  issuesSubmitIssue: {
    'en-GB': 'Submit Issue',
    'el-GR': 'Υποβολή Προβλήματος'
  },
  issuesNoIssuesFound: {
    'en-GB': 'No issues found',
    'el-GR': 'Δεν βρέθηκαν προβλήματα'
  },
  issuesStartReporting: {
    'en-GB': 'Start by reporting your first issue',
    'el-GR': 'Ξεκινήστε αναφέροντας το πρώτο σας πρόβλημα'
  },
  issuesSearch: {
    'en-GB': 'Search issues...',
    'el-GR': 'Αναζήτηση προβλημάτων...'
  },
  issuesAllStatuses: {
    'en-GB': 'All statuses',
    'el-GR': 'Όλες οι καταστάσεις'
  },
  issuesAllCategories: {
    'en-GB': 'All categories',
    'el-GR': 'Όλες οι κατηγορίες'
  },
  issuesAllPriorities: {
    'en-GB': 'All priorities',
    'el-GR': 'Όλες οι προτεραιότητες'
  },
  issuesFilters: {
    'en-GB': 'Filters',
    'el-GR': 'Φίλτρα'
  },
  issuesStatus: {
    'en-GB': 'Status',
    'el-GR': 'Κατάσταση'
  },
  issuesOpen: {
    'en-GB': 'Open',
    'el-GR': 'Ανοιχτό'
  },
  issuesInProgress: {
    'en-GB': 'In Progress',
    'el-GR': 'Σε Εξέλιξη'
  },
  issuesResolved: {
    'en-GB': 'Resolved',
    'el-GR': 'Επιλύθηκε'
  },
  issuesClosed: {
    'en-GB': 'Closed',
    'el-GR': 'Κλειστό'
  },
  issuesLow: {
    'en-GB': 'Low',
    'el-GR': 'Χαμηλή'
  },
  issuesMedium: {
    'en-GB': 'Medium',
    'el-GR': 'Μεσαία'
  },
  issuesHigh: {
    'en-GB': 'High',
    'el-GR': 'Υψηλή'
  },
  issuesUrgent: {
    'en-GB': 'Urgent',
    'el-GR': 'Επείγον'
  },
  
  // Admin translations
  adminTitle: {
    'en-GB': 'Administration Panel',
    'el-GR': 'Πάνελ Διαχείρισης'
  },
  adminSubtitle: {
    'en-GB': 'Manage users, transactions, and system settings',
    'el-GR': 'Διαχειριστείτε χρήστες, συναλλαγές και ρυθμίσεις συστήματος'
  },
  adminOverview: {
    'en-GB': 'System Overview',
    'el-GR': 'Επισκόπηση Συστήματος'
  },
  adminUsers: {
    'en-GB': 'Users',
    'el-GR': 'Χρήστες'
  },
  adminTransactions2: {
    'en-GB': 'Transactions',
    'el-GR': 'Συναλλαγές'
  },
  adminSystemHealth: {
    'en-GB': 'System Health',
    'el-GR': 'Υγεία Συστήματος'
  },
  adminActiveUsers: {
    'en-GB': 'Active Users',
    'el-GR': 'Ενεργοί Χρήστες'
  },
  adminTotalVolume: {
    'en-GB': 'Total Volume',
    'el-GR': 'Συνολικός Όγκος'
  },
  adminPendingIssues: {
    'en-GB': 'Pending Issues',
    'el-GR': 'Προβλήματα σε Εκκρεμότητα'
  },
  adminRecentActivity: {
    'en-GB': 'Recent Activity',
    'el-GR': 'Πρόσφατη Δραστηριότητα'
  },
  adminSystemAlerts: {
    'en-GB': 'System Alerts',
    'el-GR': 'Ειδοποιήσεις Συστήματος'
  },
  adminManageUsers: {
    'en-GB': 'Manage Users',
    'el-GR': 'Διαχείριση Χρηστών'
  },
  adminViewTransactions: {
    'en-GB': 'View Transactions',
    'el-GR': 'Προβολή Συναλλαγών'
  },
  adminIssueManagement: {
    'en-GB': 'Issue Management',
    'el-GR': 'Διαχείριση Προβλημάτων'
  },
  adminSystemSettings: {
    'en-GB': 'System Settings',
    'el-GR': 'Ρυθμίσεις Συστήματος'
  },
  
  // Profile translations
  profileTitle: {
    'en-GB': 'Profile Settings',
    'el-GR': 'Ρυθμίσεις Προφίλ'
  },
  profileSubtitle: {
    'en-GB': 'Manage your account information and preferences',
    'el-GR': 'Διαχειριστείτε τις πληροφορίες και τις προτιμήσεις του λογαριασμού σας'
  },
  profilePersonalInfo: {
    'en-GB': 'Personal Information',
    'el-GR': 'Προσωπικές Πληροφορίες'
  },
  profileSecuritySettings: {
    'en-GB': 'Security Settings',
    'el-GR': 'Ρυθμίσεις Ασφαλείας'
  },
  profilePreferences: {
    'en-GB': 'Preferences',
    'el-GR': 'Προτιμήσεις'
  },
  profileActivityLog: {
    'en-GB': 'Activity Log',
    'el-GR': 'Αρχείο Δραστηριότητας'
  },
  profileChangePassword: {
    'en-GB': 'Change Password',
    'el-GR': 'Αλλαγή Κωδικού Πρόσβασης'
  },
  profileTwoFactor: {
    'en-GB': 'Two-Factor Authentication',
    'el-GR': 'Ταυτοποίηση Δύο Παραγόντων'
  },
  profileNotificationSettings: {
    'en-GB': 'Notification Settings',
    'el-GR': 'Ρυθμίσεις Ειδοποιήσεων'
  },
  profilePrivacySettings: {
    'en-GB': 'Privacy Settings',
    'el-GR': 'Ρυθμίσεις Απορρήτου'
  },
  
  // Wallet translations
  walletTitle: {
    'en-GB': 'Wallet Management',
    'el-GR': 'Διαχείριση Πορτοφολιού'
  },
  walletSubtitle: {
    'en-GB': 'Manage your balance and payment methods',
    'el-GR': 'Διαχειριστείτε το υπόλοιπο και τις μεθόδους πληρωμής σας'
  },
  walletBalance: {
    'en-GB': 'Wallet Balance',
    'el-GR': 'Υπόλοιπο Πορτοφολιού'
  },
  walletAddFunds: {
    'en-GB': 'Add Funds',
    'el-GR': 'Προσθήκη Κεφαλαίων'
  },
  walletWithdraw: {
    'en-GB': 'Withdraw',
    'el-GR': 'Ανάληψη'
  },
  walletPaymentMethods: {
    'en-GB': 'Payment Methods',
    'el-GR': 'Μέθοδοι Πληρωμής'
  },
  walletAddPaymentMethod: {
    'en-GB': 'Add Payment Method',
    'el-GR': 'Προσθήκη Μεθόδου Πληρωμής'
  },
  walletTransactionHistory: {
    'en-GB': 'Transaction History',
    'el-GR': 'Ιστορικό Συναλλαγών'
  },
  
  // Authentication translations
  authWelcome: {
    'en-GB': 'Welcome to WhoopsPay',
    'el-GR': 'Καλώς ήρθατε στο WhoopsPay'
  },
  authSecureLogin: {
    'en-GB': 'Secure login to your account',
    'el-GR': 'Ασφαλής σύνδεση στον λογαριασμό σας'
  },
  authQuickAccess: {
    'en-GB': 'Quick Test Access',
    'el-GR': 'Γρήγορη Πρόσβαση Δοκιμής'
  },
  authLoginAsUser: {
    'en-GB': 'Login as User',
    'el-GR': 'Σύνδεση ως Χρήστης'
  },
  authLoginAsAdmin: {
    'en-GB': 'Login as Admin',
    'el-GR': 'Σύνδεση ως Διαχειριστής'
  },
  authCreateAccount2: {
    'en-GB': 'Create Account',
    'el-GR': 'Δημιουργία Λογαριασμού'
  },
  authForgotPassword: {
    'en-GB': 'Forgot Password?',
    'el-GR': 'Ξεχάσατε τον Κωδικό;'
  },
  authResetPassword: {
    'en-GB': 'Reset Password',
    'el-GR': 'Επαναφορά Κωδικού'
  },
  authSignUpHere2: {
    'en-GB': 'Sign up here',
    'el-GR': 'Εγγραφή εδώ'
  },
  authSignInHere: {
    'en-GB': 'Sign in here',
    'el-GR': 'Σύνδεση εδώ'
  },
  authRememberPassword: {
    'en-GB': 'Remember your password?',
    'el-GR': 'Θυμάστε τον κωδικό σας;'
  },
  authDontHaveAccount2: {
    'en-GB': "Don't have an account?",
    'el-GR': 'Δεν έχετε λογαριασμό;'
  },
  authAlreadyHaveAccount2: {
    'en-GB': 'Already have an account?',
    'el-GR': 'Έχετε ήδη λογαριασμό;'
  },
  authProcessing: {
    'en-GB': 'Processing...',
    'el-GR': 'Επεξεργασία...'
  },
  authSendResetLink: {
    'en-GB': 'Send Reset Link',
    'el-GR': 'Αποστολή Συνδέσμου Επαναφοράς'
  },
  authBackToEdit: {
    'en-GB': 'Back to Edit',
    'el-GR': 'Επιστροφή για Επεξεργασία'
  },
  authClearForm: {
    'en-GB': 'Clear Form',
    'el-GR': 'Εκκαθάριση Φόρμας'
  },
  authReviewTransfer: {
    'en-GB': 'Review Transfer',
    'el-GR': 'Έλεγχος Μεταφοράς'
  },
  
  // Common UI elements
  loading: {
    'en-GB': 'Loading...',
    'el-GR': 'Φόρτωση...'
  },
  refresh: {
    'en-GB': 'Refresh',
    'el-GR': 'Ανανέωση'
  },
  search: {
    'en-GB': 'Search',
    'el-GR': 'Αναζήτηση'
  },
  filter: {
    'en-GB': 'Filter',
    'el-GR': 'Φίλτρο'
  },
  sort: {
    'en-GB': 'Sort',
    'el-GR': 'Ταξινόμηση'
  },
  export: {
    'en-GB': 'Export',
    'el-GR': 'Εξαγωγή'
  },
  view: {
    'en-GB': 'View',
    'el-GR': 'Προβολή'
  },
  manage: {
    'en-GB': 'Manage',
    'el-GR': 'Διαχείριση'
  },
  update: {
    'en-GB': 'Update',
    'el-GR': 'Ενημέρωση'
  },
  create: {
    'en-GB': 'Create',
    'el-GR': 'Δημιουργία'
  },
  close: {
    'en-GB': 'Close',
    'el-GR': 'Κλείσιμο'
  },
  confirm: {
    'en-GB': 'Confirm',
    'el-GR': 'Επιβεβαίωση'
  },
  continue: {
    'en-GB': 'Continue',
    'el-GR': 'Συνέχεια'
  },
  back: {
    'en-GB': 'Back',
    'el-GR': 'Πίσω'
  },
  next: {
    'en-GB': 'Next',
    'el-GR': 'Επόμενο'
  },
  previous: {
    'en-GB': 'Previous',
    'el-GR': 'Προηγούμενο'
  },
  yes: {
    'en-GB': 'Yes',
    'el-GR': 'Ναι'
  },
  no: {
    'en-GB': 'No',
    'el-GR': 'Όχι'
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