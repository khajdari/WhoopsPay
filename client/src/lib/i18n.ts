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
  seeAll: TranslationKey;
  
  // Money operations
  sendMoney: TranslationKey;
  requestMoney: TranslationKey;
  amount: TranslationKey;
  recipient: TranslationKey;
  verifyingPayment: TranslationKey;
  waitingForCallback: TranslationKey;
  listeningForPaymentConfirmation: TranslationKey;
  paymentVerified: TranslationKey;
  verificationFailed: TranslationKey;
  amountMismatch: TranslationKey;
  verificationPending: TranslationKey;
  transactionComplete: TranslationKey;
  transactionFailed: TranslationKey;
  transactionProcessedSuccessfully: TranslationKey;
  transactionCouldNotBeCompleted: TranslationKey;
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
  
  // Dashboard sections
  recentActivity: TranslationKey;
  recentTransactions: TranslationKey;
  whoopsPayBalance: TranslationKey;
  paymentMethods: TranslationKey;
  addCard: TranslationKey;
  addBank: TranslationKey;
  availableBalance: TranslationKey;
  manageBalance: TranslationKey;
  
  // Issue Reporting
  issueReportingCenter: TranslationKey;
  submitNewIssue: TranslationKey;
  createIssueReport: TranslationKey;
  submitIssueReport: TranslationKey;
  yourIssueReports: TranslationKey;
  openIssues: TranslationKey;
  inProgress: TranslationKey;
  resolved: TranslationKey;
  totalIssues: TranslationKey;
  noIssueReports: TranslationKey;
  createFirstIssue: TranslationKey;
  reportProblems: TranslationKey;
  trackIssueStatus: TranslationKey;
  detailedInformation: TranslationKey;
  submitTrackIssues: TranslationKey;
  
  // Status labels
  statusOpen: TranslationKey;
  statusInProgress: TranslationKey;
  statusResolved: TranslationKey;
  statusClosed: TranslationKey;
  
  // Priority labels
  priorityCritical: TranslationKey;
  priorityHigh: TranslationKey;
  priorityMedium: TranslationKey;
  priorityLow: TranslationKey;
  
  // Transaction status and types
  onus: TranslationKey;
  offus: TranslationKey;
  
  // Administration
  accountInformation: TranslationKey;
  administration: TranslationKey;
  adminMenuAdministration: TranslationKey;
  adminPanel: TranslationKey;
  systemHealth: TranslationKey;
  systemHealthDashboard: TranslationKey;
  serverStatus: TranslationKey;
  databaseHealth: TranslationKey;
  apiDocumentation: TranslationKey;
  adminApiDocumentation: TranslationKey;
  systemLogs: TranslationKey;
  expressLogs: TranslationKey;
  adminExpressLogs: TranslationKey;
  databaseLogs: TranslationKey;
  adminDatabaseLogs: TranslationKey;
  userManagement: TranslationKey;
  issueManagement: TranslationKey;
  systemOverview: TranslationKey;
  uptime: TranslationKey;
  memoryUsage: TranslationKey;
  cpuUsage: TranslationKey;
  activeConnections: TranslationKey;
  dashboardTotalUsers: TranslationKey;
  totalTransactions: TranslationKey;
  pendingIssues: TranslationKey;
  dashboardOnline: TranslationKey;
  statusOnline: TranslationKey;
  adminOnline: TranslationKey;
  offline: TranslationKey;
  healthy: TranslationKey;
  warning: TranslationKey;
  statusCritical: TranslationKey;
  
  // Greetings and common UI
  hi: TranslationKey;
  issueReports: TranslationKey;
  noPendingRequests: TranslationKey;
  noPendingRequestsDesc: TranslationKey;
  pendingRequests: TranslationKey;
  
  // Profile and Settings
  profileSettings: TranslationKey;
  accountSettings: TranslationKey;
  backToDashboard: TranslationKey;
  firstName: TranslationKey;
  lastName: TranslationKey;
  email: TranslationKey;
  address: TranslationKey;
  nationality: TranslationKey;
  gender: TranslationKey;
  security: TranslationKey;
  changePassword: TranslationKey;
  currentPassword: TranslationKey;
  newPassword: TranslationKey;
  confirmPassword: TranslationKey;
  updatePassword: TranslationKey;
  passwordChangedSuccess: TranslationKey;
  passwordChangedDesc: TranslationKey;
  passwordChangeError: TranslationKey;
  passwordsDontMatch: TranslationKey;
  passwordsDontMatchDesc: TranslationKey;
  passwordTooShort: TranslationKey;
  passwordTooShortDesc: TranslationKey;
  profileUpdatedSuccess: TranslationKey;
  profileUpdatedDesc: TranslationKey;
  profileUpdateError: TranslationKey;
  enterCurrentPassword: TranslationKey;
  enterNewPassword: TranslationKey;
  confirmNewPassword: TranslationKey;
  userId: TranslationKey;
  accountCreated: TranslationKey;
  
  // Admin dashboard specific
  systemHealthDashboardTitle: TranslationKey;
  monitorApplicationHealth: TranslationKey;
  database: TranslationKey;
  apiServer: TranslationKey;
  running: TranslationKey;
  adminTotalUsers: TranslationKey;
  systemFailures: TranslationKey;
  systemFailuresTable: TranslationKey;
  errorTime: TranslationKey;
  errorType: TranslationKey;
  errorMessage: TranslationKey;
  errorSeverity: TranslationKey;
  noSystemFailures: TranslationKey;
  accessAdminPanel: TranslationKey;
  monitorIssues: TranslationKey;
  adminNavigation: TranslationKey;
  adminIssueReports: TranslationKey;
  
  // Administration panel specific
  administrationPanel: TranslationKey;
  systemMonitoringApi: TranslationKey;
  sensitiveInfoWarning: TranslationKey;
  interfaceApiDocumentation: TranslationKey;
  interfaceExpressLogs: TranslationKey;
  interfaceDatabaseLogs: TranslationKey;
  dbManagement: TranslationKey;
  apiDocumentationSwagger: TranslationKey;
  
  // Issue reporting page
  issueReportsMonitor: TranslationKey;
  monitorManageIssueReports: TranslationKey;
  allStatus: TranslationKey;
  allPriority: TranslationKey;
  allCategories: TranslationKey;
  noIssueReportsFound: TranslationKey;

  // Status options (renamed to avoid duplicates)
  issueStatusOpen: TranslationKey;
  issueStatusInProgress: TranslationKey;
  issueStatusResolved: TranslationKey;
  issueStatusClosed: TranslationKey;

  // Priority options (renamed to avoid duplicates)
  issuePriorityCritical: TranslationKey;
  issuePriorityHigh: TranslationKey;
  issuePriorityMedium: TranslationKey;
  issuePriorityLow: TranslationKey;

  // Category options
  technical: TranslationKey;
  payment: TranslationKey;
  categorySecurity: TranslationKey;
  categorySecurityOption: TranslationKey;
  account: TranslationKey;
  other: TranslationKey;
  
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
  'dashboard.pendingRequests': TranslationKey;
  'dashboard.sendMoney': TranslationKey;
  'dashboard.addMoney': TranslationKey;
  'dashboard.viewTransactions': TranslationKey;
  'dashboard.settings': TranslationKey;
  'dashboard.recentTransactions': TranslationKey;
  'dashboard.noTransactions': TranslationKey;
  'dashboard.sendFirstPayment': TranslationKey;
  'dashboard.noPaymentMethods': TranslationKey;
  'dashboard.addPaymentMethod': TranslationKey;

  // Transactions page
  'transactions.title': TranslationKey;
  'transactions.subtitle': TranslationKey;
  'transactions.overview': TranslationKey;
  'transactions.totalTransactions': TranslationKey;
  'transactions.totalSent': TranslationKey;
  'transactions.totalReceived': TranslationKey;
  'transactions.monthlyVolume': TranslationKey;
  'transactions.refresh': TranslationKey;
  'transactions.export': TranslationKey;
  'transactions.allTransactions': TranslationKey;
  'transactions.noTransactionsFound': TranslationKey;
  'transactions.filterByStatus': TranslationKey;
  'transactions.searchTransactions': TranslationKey;
  'transactions.all': TranslationKey;
  'transactions.sent': TranslationKey;
  'transactions.received': TranslationKey;
  'transactions.onus': TranslationKey;
  'transactions.offus': TranslationKey;
  'transactions.searchPlaceholder': TranslationKey;
  'transactions.filter': TranslationKey;
  'transactions.previous': TranslationKey;
  'transactions.next': TranslationKey;
  'transactions.page': TranslationKey;
  'transactions.of': TranslationKey;
  'transactions.loading': TranslationKey;

  // Wallet page  
  'wallet.title': TranslationKey;
  'wallet.currentBalance': TranslationKey;
  'wallet.availableBalance': TranslationKey;
  'wallet.pendingTransactions': TranslationKey;
  'wallet.addFunds': TranslationKey;
  'wallet.withdrawFunds': TranslationKey;
  'wallet.managePaymentMethods': TranslationKey;
  'wallet.transactionHistory': TranslationKey;
  'wallet.quickSend': TranslationKey;

  // Profile page
  'profile.title': TranslationKey;
  'profile.personalInfo': TranslationKey;
  'profile.accountSettings': TranslationKey;
  'profile.securitySettings': TranslationKey;
  'profile.changePassword': TranslationKey;
  'profile.twoFactorAuth': TranslationKey;
  'profile.privacySettings': TranslationKey;
  'profile.accountActivity': TranslationKey;
  'profile.deleteAccount': TranslationKey;
  'profile.saveChanges': TranslationKey;

  // Admin page
  'admin.title': TranslationKey;
  'admin.userManagement': TranslationKey;
  'admin.systemStats': TranslationKey;
  'admin.transactionMonitoring': TranslationKey;
  'admin.securityLogs': TranslationKey;
  'admin.systemHealth': TranslationKey;
  'admin.backupRestore': TranslationKey;
  'admin.userActivity': TranslationKey;
  'admin.configureSystem': TranslationKey;

  // Issue Reporting page
  'issues.title': TranslationKey;
  'issues.reportIssue': TranslationKey;
  'issues.issueType': TranslationKey;
  'issues.issueDescription': TranslationKey;
  'issues.submitReport': TranslationKey;
  'issues.myReports': TranslationKey;
  'issues.reportStatus': TranslationKey;
  'issues.priority': TranslationKey;
  'issues.assignedTo': TranslationKey;

  // External redirect page
  paymentApproved: TranslationKey;
  paymentRejected: TranslationKey;
  approvedDescription: TranslationKey;
  rejectedDescription: TranslationKey;
  orderId: TranslationKey;
  service: TranslationKey;
  redirectingTo: TranslationKey;
  redirectingIn: TranslationKey;
  seconds: TranslationKey;
  redirecting: TranslationKey;
  stayHere: TranslationKey;
  redirectNow: TranslationKey;

  // Send Money page
  'sendMoney.title': TranslationKey;
  'sendMoney.subtitle': TranslationKey;
  'sendMoney.backToDashboard': TranslationKey;
  'sendMoney.send': TranslationKey;
  'sendMoney.request': TranslationKey;
  'sendMoney.addMoney': TranslationKey;
  'sendMoney.withdraw': TranslationKey;
  'sendMoney.sendTo': TranslationKey;
  'sendMoney.amount': TranslationKey;
  'sendMoney.note': TranslationKey;
  'sendMoney.optional': TranslationKey;
  'sendMoney.sendButton': TranslationKey;
  'sendMoney.recipientPlaceholder': TranslationKey;
  'sendMoney.amountPlaceholder': TranslationKey;
  'sendMoney.notePlaceholder': TranslationKey;
  'sendMoney.requestFrom': TranslationKey;
  'sendMoney.requestButton': TranslationKey;
  'sendMoney.addMoneyButton': TranslationKey;
  'sendMoney.withdrawButton': TranslationKey;
  'sendMoney.source': TranslationKey;
  'sendMoney.destination': TranslationKey;
  'sendMoney.sourcePlaceholder': TranslationKey;
  'sendMoney.destinationPlaceholder': TranslationKey;
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
  seeAll: {
    'en-GB': 'See all',
    'el-GR': 'Δείτε όλα'
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
  
  // Additional wallet translations
  addCard: {
    'en-GB': 'Add Card',
    'el-GR': 'Προσθήκη Κάρτας'
  },
  addBank: {
    'en-GB': 'Add Bank',
    'el-GR': 'Προσθήκη Τράπεζας'
  },
  availableBalance: {
    'en-GB': 'Available balance',
    'el-GR': 'Διαθέσιμο υπόλοιπο'
  },
  manageBalance: {
    'en-GB': 'Manage your balance and payment methods',
    'el-GR': 'Διαχειριστείτε το υπόλοιπό σας και τις μεθόδους πληρωμής'
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


  rejected: {
    'en-GB': 'Rejected',
    'el-GR': 'Απορρίφθηκε'
  },
  completed: {
    'en-GB': 'Completed',
    'el-GR': 'Ολοκληρώθηκε'
  },
  pending: {
    'en-GB': 'Pending',
    'el-GR': 'Εκκρεμεί'
  },
  
  // Issue Reporting
  issueReportingCenter: {
    'en-GB': 'Issue Reporting Center',
    'el-GR': 'Κέντρο Αναφοράς Προβλημάτων'
  },
  submitNewIssue: {
    'en-GB': 'Submit New Issue',
    'el-GR': 'Υποβολή Νέου Προβλήματος'
  },
  createIssueReport: {
    'en-GB': 'Create Issue Report',
    'el-GR': 'Δημιουργία Αναφοράς Προβλήματος'
  },
  submitIssueReport: {
    'en-GB': 'Submit Issue Report',
    'el-GR': 'Υποβολή Αναφοράς Προβλήματος'
  },
  yourIssueReports: {
    'en-GB': 'Your Issue Reports',
    'el-GR': 'Οι Αναφορές Σας'
  },
  openIssues: {
    'en-GB': 'Open Issues:',
    'el-GR': 'Ανοιχτά Προβλήματα:'
  },
  inProgress: {
    'en-GB': 'In Progress:',
    'el-GR': 'Σε Εξέλιξη:'
  },
  resolved: {
    'en-GB': 'Resolved:',
    'el-GR': 'Επιλύθηκαν:'
  },
  totalIssues: {
    'en-GB': 'Total Issues:',
    'el-GR': 'Συνολικά Προβλήματα:'
  },
  noIssueReports: {
    'en-GB': 'No issue reports found.',
    'el-GR': 'Δε βρέθηκαν αναφορές προβλημάτων.'
  },
  createFirstIssue: {
    'en-GB': 'Create your first issue report to get started.',
    'el-GR': 'Δημιουργήστε την πρώτη σας αναφορά για να ξεκινήσετε.'
  },
  reportProblems: {
    'en-GB': 'Report any problems or concerns you encounter',
    'el-GR': 'Αναφέρετε οποιαδήποτε προβλήματα ή ανησυχίες αντιμετωπίζετε'
  },
  trackIssueStatus: {
    'en-GB': 'Track the status and progress of your submitted issues',
    'el-GR': 'Παρακολουθήστε την κατάσταση των αναφορών σας'
  },
  detailedInformation: {
    'en-GB': 'Provide detailed information about the issue you\'re experiencing',
    'el-GR': 'Παρέχετε λεπτομερείς πληροφορίες για το πρόβλημα που αντιμετωπίζετε'
  },
  submitTrackIssues: {
    'en-GB': 'Submit and track issue reports for bugs, security concerns, and other platform issues',
    'el-GR': 'Υποβολή και παρακολούθηση αναφορών για σφάλματα, ζητήματα ασφαλείας και άλλα προβλήματα πλατφόρμας'
  },
  // Status labels

  // Priority labels removed - using priorityHigh, priorityMedium, priorityLow instead
  
  // Greetings and common UI
  hi: {
    'en-GB': 'Hi',
    'el-GR': 'Γεια σας'
  },
  issueReports: {
    'en-GB': 'Issue Reports',
    'el-GR': 'Αναφορές Προβλημάτων'
  },
  noPendingRequests: {
    'en-GB': 'No pending money requests',
    'el-GR': 'Δεν υπάρχουν εκκρεμείς αιτήσεις χρημάτων'
  },
  noPendingRequestsDesc: {
    'en-GB': 'When someone requests money from you, it will appear here',
    'el-GR': 'Όταν κάποιος σας ζητήσει χρήματα, θα εμφανιστεί εδώ'
  },
  pendingRequests: {
    'en-GB': 'Pending Requests',
    'el-GR': 'Εκκρεμή Αιτήματα'
  },
  
  // Profile and Settings
  profileSettings: {
    'en-GB': 'Profile Settings',
    'el-GR': 'Ρυθμίσεις Προφίλ'
  },
  accountSettings: {
    'en-GB': 'Account Settings',
    'el-GR': 'Ρυθμίσεις Λογαριασμού'
  },
  backToDashboard: {
    'en-GB': 'Back to Dashboard',
    'el-GR': 'Επιστροφή στον Πίνακα Ελέγχου'
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
  address: {
    'en-GB': 'Address',
    'el-GR': 'Διεύθυνση'
  },
  nationality: {
    'en-GB': 'Nationality',
    'el-GR': 'Εθνικότητα'
  },
  gender: {
    'en-GB': 'Gender',
    'el-GR': 'Φύλο'
  },
  security: {
    'en-GB': 'Security',
    'el-GR': 'Ασφάλεια'
  },
  changePassword: {
    'en-GB': 'Change Password',
    'el-GR': 'Αλλαγή Κωδικού'
  },
  currentPassword: {
    'en-GB': 'Current Password',
    'el-GR': 'Τρέχων Κωδικός'
  },
  newPassword: {
    'en-GB': 'New Password',
    'el-GR': 'Νέος Κωδικός'
  },
  confirmPassword: {
    'en-GB': 'Confirm New Password',
    'el-GR': 'Επιβεβαίωση Νέου Κωδικού'
  },
  updatePassword: {
    'en-GB': 'Update Password',
    'el-GR': 'Ενημέρωση Κωδικού'
  },
  passwordChangedSuccess: {
    'en-GB': 'Password changed successfully!',
    'el-GR': 'Ο κωδικός άλλαξε επιτυχώς!'
  },
  passwordChangedDesc: {
    'en-GB': 'Your password has been updated.',
    'el-GR': 'Ο κωδικός σας ενημερώθηκε.'
  },
  passwordChangeError: {
    'en-GB': 'Failed to change password',
    'el-GR': 'Αποτυχία αλλαγής κωδικού'
  },
  passwordsDontMatch: {
    'en-GB': 'Passwords don\'t match',
    'el-GR': 'Οι κωδικοί δεν ταιριάζουν'
  },
  passwordsDontMatchDesc: {
    'en-GB': 'Please make sure your new passwords match.',
    'el-GR': 'Παρακαλώ βεβαιωθείτε ότι οι νέοι κωδικοί ταιριάζουν.'
  },
  passwordTooShort: {
    'en-GB': 'Password too short',
    'el-GR': 'Ο κωδικός είναι πολύ μικρός'
  },
  passwordTooShortDesc: {
    'en-GB': 'Password must be at least 6 characters long.',
    'el-GR': 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.'
  },
  profileUpdatedSuccess: {
    'en-GB': 'Profile updated successfully!',
    'el-GR': 'Το προφίλ ενημερώθηκε επιτυχώς!'
  },
  profileUpdatedDesc: {
    'en-GB': 'Your changes have been saved.',
    'el-GR': 'Οι αλλαγές σας αποθηκεύτηκαν.'
  },
  profileUpdateError: {
    'en-GB': 'Failed to update profile',
    'el-GR': 'Αποτυχία ενημέρωσης προφίλ'
  },
  enterCurrentPassword: {
    'en-GB': 'Enter current password',
    'el-GR': 'Εισάγετε τον τρέχοντα κωδικό'
  },
  enterNewPassword: {
    'en-GB': 'Enter new password',
    'el-GR': 'Εισάγετε νέο κωδικό'
  },
  confirmNewPassword: {
    'en-GB': 'Confirm new password',
    'el-GR': 'Επιβεβαιώστε τον νέο κωδικό'
  },
  userId: {
    'en-GB': 'User ID',
    'el-GR': 'ID Χρήστη'
  },
  accountCreated: {
    'en-GB': 'Account Created',
    'el-GR': 'Δημιουργία Λογαριασμού'
  },
  
  // Admin dashboard specific
  systemHealthDashboardTitle: {
    'en-GB': 'System Health Dashboard',
    'el-GR': 'Πίνακας Υγείας Συστήματος'
  },
  monitorApplicationHealth: {
    'en-GB': 'Monitor application health and system status',
    'el-GR': 'Παρακολούθηση υγείας εφαρμογής και κατάστασης συστήματος'
  },
  database: {
    'en-GB': 'Database',
    'el-GR': 'Βάση Δεδομένων'
  },

  apiServer: {
    'en-GB': 'API Server',
    'el-GR': 'Διακομιστής API'
  },
  running: {
    'en-GB': 'Running',
    'el-GR': 'Εκτελείται'
  },
  adminTotalUsers: {
    'en-GB': 'Total Users',
    'el-GR': 'Σύνολο Χρηστών'
  },
  systemFailures: {
    'en-GB': 'System Failures',
    'el-GR': 'Σφάλματα Συστήματος'
  },
  systemFailuresTable: {
    'en-GB': 'Recent System Failures',
    'el-GR': 'Πρόσφατα Σφάλματα Συστήματος'
  },
  errorTime: {
    'en-GB': 'Time',
    'el-GR': 'Ώρα'
  },
  errorType: {
    'en-GB': 'Type',
    'el-GR': 'Τύπος'
  },
  errorMessage: {
    'en-GB': 'Message',
    'el-GR': 'Μήνυμα'
  },
  errorSeverity: {
    'en-GB': 'Severity',
    'el-GR': 'Σοβαρότητα'
  },
  noSystemFailures: {
    'en-GB': 'No system failures detected',
    'el-GR': 'Δεν εντοπίστηκαν σφάλματα συστήματος'
  },
  accessAdminPanel: {
    'en-GB': 'Access Admin Panel',
    'el-GR': 'Πρόσβαση στο Πάνελ Διαχειριστή'
  },
  monitorIssues: {
    'en-GB': 'Monitor Issues',
    'el-GR': 'Παρακολούθηση Ζητημάτων'
  },
  adminNavigation: {
    'en-GB': 'Administration',
    'el-GR': 'Διαχείριση'
  },
  adminIssueReports: {
    'en-GB': 'Issue Reports',
    'el-GR': 'Αναφορές Προβλημάτων'
  },
  
  // Administration panel specific
  administrationPanel: {
    'en-GB': 'Administration Panel',
    'el-GR': 'Πάνελ Διαχείρισης'
  },
  systemMonitoringApi: {
    'en-GB': 'System monitoring and API documentation',
    'el-GR': 'Παρακολούθηση συστήματος και τεκμηρίωση API'
  },
  sensitiveInfoWarning: {
    'en-GB': 'Warning: This panel contains sensitive system information and API documentation. Access is logged and monitored.',
    'el-GR': 'Προειδοποίηση: Αυτό το πάνελ περιέχει ευαίσθητες πληροφορίες συστήματος και τεκμηρίωση API. Η πρόσβαση καταγράφεται και παρακολουθείται.'
  },
  apiDocumentation: {
    'en-GB': 'API Documentation',
    'el-GR': 'Τεκμηρίωση API'
  },
  expressLogs: {
    'en-GB': 'Express Logs',
    'el-GR': 'Αρχεία Express'
  },
  databaseLogs: {
    'en-GB': 'Database Logs',
    'el-GR': 'Αρχεία Βάσης Δεδομένων'
  },
  dbManagement: {
    'en-GB': 'DB Management',
    'el-GR': 'Διαχείριση ΒΔ'
  },
  apiDocumentationSwagger: {
    'en-GB': 'API Documentation (Swagger UI)',
    'el-GR': 'Τεκμηρίωση API (Swagger UI)'
  },
  
  // Issue reporting page
  issueReportsMonitor: {
    'en-GB': 'Issue Reports Monitor',
    'el-GR': 'Παρακολούθηση Αναφορών Προβλημάτων'
  },
  monitorManageIssueReports: {
    'en-GB': 'Monitor and manage user-submitted issue reports',
    'el-GR': 'Παρακολούθηση και διαχείριση αναφορών προβλημάτων χρηστών'
  },
  allStatus: {
    'en-GB': 'All Status',
    'el-GR': 'Όλες οι Καταστάσεις'
  },
  allPriority: {
    'en-GB': 'All Priority',
    'el-GR': 'Όλες οι Προτεραιότητες'
  },
  allCategories: {
    'en-GB': 'All Categories',
    'el-GR': 'Όλες οι Κατηγορίες'
  },
  noIssueReportsFound: {
    'en-GB': 'No issue reports found matching the current filters',
    'el-GR': 'Δεν βρέθηκαν αναφορές προβλημάτων που να ταιριάζουν με τα τρέχοντα φίλτρα'
  },

  // Status options
  statusOpen: {
    'en-GB': 'Open',
    'el-GR': 'Ανοιχτό'
  },
  statusInProgress: {
    'en-GB': 'In Progress',
    'el-GR': 'Σε Εξέλιξη'
  },
  // Status options
  statusResolved: {
    'en-GB': 'Resolved',
    'el-GR': 'Επιλυμένο'
  },
  statusClosed: {
    'en-GB': 'Closed',
    'el-GR': 'Κλειστό'
  },

  // Priority options
  priorityCritical: {
    'en-GB': 'Critical',
    'el-GR': 'Κρίσιμη'
  },
  priorityHigh: {
    'en-GB': 'High',
    'el-GR': 'Υψηλή'
  },
  priorityMedium: {
    'en-GB': 'Medium',
    'el-GR': 'Μεσαία'
  },
  priorityLow: {
    'en-GB': 'Low',
    'el-GR': 'Χαμηλή'
  },

  // Category options
  technical: {
    'en-GB': 'Technical',
    'el-GR': 'Τεχνικό'
  },
  payment: {
    'en-GB': 'Payment',
    'el-GR': 'Πληρωμή'
  },
  categorySecurity: {
    'en-GB': 'Security',
    'el-GR': 'Ασφάλεια'
  },
  account: {
    'en-GB': 'Account',
    'el-GR': 'Λογαριασμός'
  },
  categorySecurityOption: {
    'en-GB': 'Security',
    'el-GR': 'Ασφάλεια'
  },
  other: {
    'en-GB': 'Other',
    'el-GR': 'Άλλο'
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
  
  // External redirect translations
  paymentApproved: {
    'en-GB': 'Payment Approved',
    'el-GR': 'Πληρωμή Εγκρίθηκε'
  },
  paymentRejected: {
    'en-GB': 'Payment Rejected',
    'el-GR': 'Πληρωμή Απορρίφθηκε'
  },
  approvedDescription: {
    'en-GB': 'Your payment has been processed successfully',
    'el-GR': 'Η πληρωμή σας επεξεργάστηκε επιτυχώς'
  },
  rejectedDescription: {
    'en-GB': 'The payment request has been declined',
    'el-GR': 'Το αίτημα πληρωμής απορρίφθηκε'
  },
  orderId: {
    'en-GB': 'Order ID',
    'el-GR': 'Αριθμός Παραγγελίας'
  },
  service: {
    'en-GB': 'Service',
    'el-GR': 'Υπηρεσία'
  },
  redirectingTo: {
    'en-GB': 'Redirecting to external service',
    'el-GR': 'Ανακατεύθυνση σε εξωτερική υπηρεσία'
  },
  redirectingIn: {
    'en-GB': 'Redirecting in',
    'el-GR': 'Ανακατεύθυνση σε'
  },
  seconds: {
    'en-GB': 'seconds',
    'el-GR': 'δευτερόλεπτα'
  },
  redirecting: {
    'en-GB': 'Redirecting...',
    'el-GR': 'Ανακατεύθυνση...'
  },
  stayHere: {
    'en-GB': 'Stay Here',
    'el-GR': 'Παραμονή Εδώ'
  },
  redirectNow: {
    'en-GB': 'Go Now',
    'el-GR': 'Μετάβαση Τώρα'
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
  
  // Dashboard sections
  recentActivity: {
    'en-GB': 'Recent Activity',
    'el-GR': 'Πρόσφατη Δραστηριότητα'
  },
  recentTransactions: {
    'en-GB': 'Recent Transactions',
    'el-GR': 'Πρόσφατες Συναλλαγές'
  },
  whoopsPayBalance: {
    'en-GB': 'WhoopsPay Balance',
    'el-GR': 'Υπόλοιπο WhoopsPay'
  },
  paymentMethods: {
    'en-GB': 'Payment Methods',
    'el-GR': 'Μέθοδοι Πληρωμής'
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
  
  // Transaction status and types
  onus: {
    'en-GB': 'On-Us',
    'el-GR': 'Εσωτερική'
  },
  offus: {
    'en-GB': 'Off-Us', 
    'el-GR': 'Εξωτερική'
  },

  
  // Account Information
  accountInformation: {
    'en-GB': 'Account Information',
    'el-GR': 'Πληροφορίες Λογαριασμού'
  },
  
  // Administration menu and content
  adminMenuAdministration: {
    'en-GB': 'Administration',
    'el-GR': 'Διαχείριση'
  },
  adminPanel: {
    'en-GB': 'Admin Panel',
    'el-GR': 'Πίνακας Διαχείρισης'
  },
  systemHealth: {
    'en-GB': 'System Health',
    'el-GR': 'Υγεία Συστήματος'
  },
  systemHealthDashboard: {
    'en-GB': 'System Health Dashboard',
    'el-GR': 'Πίνακας Ελέγχου Υγείας Συστήματος'
  },
  serverStatus: {
    'en-GB': 'Server Status',
    'el-GR': 'Κατάσταση Διακομιστή'
  },
  databaseHealth: {
    'en-GB': 'Database Health',
    'el-GR': 'Υγεία Βάσης Δεδομένων'
  },
  adminApiDocumentation: {
    'en-GB': 'API Documentation',
    'el-GR': 'Τεκμηρίωση API'
  },
  systemLogs: {
    'en-GB': 'System Logs',
    'el-GR': 'Αρχεία Καταγραφής Συστήματος'
  },
  adminExpressLogs: {
    'en-GB': 'Express Logs',
    'el-GR': 'Αρχεία Καταγραφής Express'
  },
  adminDatabaseLogs: {
    'en-GB': 'Database Logs',
    'el-GR': 'Αρχεία Καταγραφής Βάσης Δεδομένων'
  },
  userManagement: {
    'en-GB': 'User Management',
    'el-GR': 'Διαχείριση Χρηστών'
  },
  issueManagement: {
    'en-GB': 'Issue Management',
    'el-GR': 'Διαχείριση Ζητημάτων'
  },
  systemOverview: {
    'en-GB': 'System Overview',
    'el-GR': 'Επισκόπηση Συστήματος'
  },
  uptime: {
    'en-GB': 'Uptime',
    'el-GR': 'Χρόνος Λειτουργίας'
  },
  memoryUsage: {
    'en-GB': 'Memory Usage',
    'el-GR': 'Χρήση Μνήμης'
  },
  cpuUsage: {
    'en-GB': 'CPU Usage',
    'el-GR': 'Χρήση CPU'
  },
  activeConnections: {
    'en-GB': 'Active Connections',
    'el-GR': 'Ενεργές Συνδέσεις'
  },
  dashboardTotalUsers: {
    'en-GB': 'Total Users',
    'el-GR': 'Σύνολο Χρηστών'
  },
  totalTransactions: {
    'en-GB': 'Total Transactions',
    'el-GR': 'Σύνολο Συναλλαγών'
  },
  pendingIssues: {
    'en-GB': 'Pending Issues',
    'el-GR': 'Εκκρεμή Ζητήματα'
  },
  statusOnline: {
    'en-GB': 'Online',
    'el-GR': 'Σε Σύνδεση'
  },
  adminOnline: {
    'en-GB': 'Online',
    'el-GR': 'Σε Λειτουργία'
  },
  offline: {
    'en-GB': 'Offline', 
    'el-GR': 'Εκτός Σύνδεσης'
  },
  healthy: {
    'en-GB': 'Healthy',
    'el-GR': 'Υγιής'
  },
  warning: {
    'en-GB': 'Warning',
    'el-GR': 'Προειδοποίηση'
  },
  statusCritical: {
    'en-GB': 'Critical',
    'el-GR': 'Κρίσιμο'
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
    'en-GB': 'Pending Money Requests',
    'el-GR': 'Εκκρεμείς Αιτήσεις Χρημάτων'
  },

  // Payment component translations
  verifyingPayment: {
    'en-GB': 'Verifying payment...',
    'el-GR': 'Επαλήθευση πληρωμής...'
  },
  waitingForCallback: {
    'en-GB': 'Waiting for payment callback...',
    'el-GR': 'Αναμονή για callback πληρωμής...'
  },
  listeningForPaymentConfirmation: {
    'en-GB': 'Listening for payment confirmation from external service',
    'el-GR': 'Αναμονή επιβεβαίωσης πληρωμής από εξωτερική υπηρεσία'
  },
  paymentVerified: {
    'en-GB': 'Payment verified successfully',
    'el-GR': 'Η πληρωμή επαληθεύτηκε με επιτυχία'
  },
  verificationFailed: {
    'en-GB': 'Payment verification failed',
    'el-GR': 'Η επαλήθευση πληρωμής απέτυχε'
  },
  amountMismatch: {
    'en-GB': 'Payment amount mismatch detected',
    'el-GR': 'Ανιχνεύθηκε αναντιστοιχία ποσού πληρωμής'
  },
  verificationPending: {
    'en-GB': 'Payment verification pending',
    'el-GR': 'Επαλήθευση πληρωμής σε εκκρεμότητα'
  },
  transactionComplete: {
    'en-GB': 'Transaction completed successfully',
    'el-GR': 'Η συναλλαγή ολοκληρώθηκε με επιτυχία'
  },
  transactionFailed: {
    'en-GB': 'Transaction failed',
    'el-GR': 'Η συναλλαγή απέτυχε'
  },
  transactionProcessedSuccessfully: {
    'en-GB': 'Your transaction has been processed successfully',
    'el-GR': 'Η συναλλαγή σας έχει επεξεργαστεί με επιτυχία'
  },
  transactionCouldNotBeCompleted: {
    'en-GB': 'Your transaction could not be completed',
    'el-GR': 'Η συναλλαγή σας δεν μπόρεσε να ολοκληρωθεί'
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
  },

  // Transactions page translations
  'transactions.title': {
    'en-GB': 'Transaction History',
    'el-GR': 'Ιστορικό Συναλλαγών'
  },
  'transactions.overview': {
    'en-GB': 'Transaction Overview',
    'el-GR': 'Επισκόπηση Συναλλαγών'
  },
  'transactions.totalTransactions': {
    'en-GB': 'Total Transactions',
    'el-GR': 'Συνολικές Συναλλαγές'
  },
  'transactions.totalSent': {
    'en-GB': 'Total Sent',
    'el-GR': 'Σύνολο Αποσταλέντων'
  },
  'transactions.totalReceived': {
    'en-GB': 'Total Received',
    'el-GR': 'Σύνολο Ληφθέντων'
  },
  'transactions.monthlyVolume': {
    'en-GB': 'Monthly Volume',
    'el-GR': 'Μηνιαίος Όγκος'
  },
  'transactions.refresh': {
    'en-GB': 'Refresh',
    'el-GR': 'Ανανέωση'
  },
  'transactions.export': {
    'en-GB': 'Export CSV',
    'el-GR': 'Εξαγωγή CSV'
  },
  'transactions.allTransactions': {
    'en-GB': 'All Transactions',
    'el-GR': 'Όλες οι Συναλλαγές'
  },
  'transactions.noTransactionsFound': {
    'en-GB': 'No transactions found',
    'el-GR': 'Δεν βρέθηκαν συναλλαγές'
  },
  'transactions.filterByStatus': {
    'en-GB': 'Filter by Status',
    'el-GR': 'Φιλτράρισμα κατά Κατάσταση'
  },
  'transactions.searchTransactions': {
    'en-GB': 'Search transactions...',
    'el-GR': 'Αναζήτηση συναλλαγών...'
  },
  'transactions.subtitle': {
    'en-GB': 'View and manage your transaction history',
    'el-GR': 'Προβολή και διαχείριση του ιστορικού συναλλαγών σας'
  },
  'transactions.all': {
    'en-GB': 'All',
    'el-GR': 'Όλες'
  },
  'transactions.sent': {
    'en-GB': 'Sent',
    'el-GR': 'Απεσταλμένες'
  },
  'transactions.received': {
    'en-GB': 'Received',
    'el-GR': 'Ληφθείσες'
  },
  'transactions.onus': {
    'en-GB': 'On-Us',
    'el-GR': 'Εσωτερικές'
  },
  'transactions.offus': {
    'en-GB': 'Off-Us',
    'el-GR': 'Εξωτερικές'
  },
  'transactions.searchPlaceholder': {
    'en-GB': 'Search: @user for users, numbers for amounts, text for types...',
    'el-GR': 'Αναζήτηση: @χρήστης για χρήστες, αριθμοί για ποσά, κείμενο για τύπους...'
  },
  'transactions.filter': {
    'en-GB': 'Filter',
    'el-GR': 'Φίλτρο'
  },
  'transactions.previous': {
    'en-GB': 'Previous',
    'el-GR': 'Προηγούμενη'
  },
  'transactions.next': {
    'en-GB': 'Next',
    'el-GR': 'Επόμενη'
  },
  'transactions.page': {
    'en-GB': 'Page',
    'el-GR': 'Σελίδα'
  },
  'transactions.of': {
    'en-GB': 'of',
    'el-GR': 'από'
  },
  'transactions.loading': {
    'en-GB': 'Loading transactions...',
    'el-GR': 'Φόρτωση συναλλαγών...'
  },

  // Wallet page translations
  'wallet.title': {
    'en-GB': 'My Wallet',
    'el-GR': 'Το Πορτοφόλι μου'
  },
  'wallet.currentBalance': {
    'en-GB': 'Current Balance',
    'el-GR': 'Τρέχον Υπόλοιπο'
  },
  'wallet.availableBalance': {
    'en-GB': 'Available Balance',
    'el-GR': 'Διαθέσιμο Υπόλοιπο'
  },
  'wallet.pendingTransactions': {
    'en-GB': 'Pending Transactions',
    'el-GR': 'Συναλλαγές σε Εκκρεμότητα'
  },
  'wallet.addFunds': {
    'en-GB': 'Add Funds',
    'el-GR': 'Προσθήκη Κεφαλαίων'
  },
  'wallet.withdrawFunds': {
    'en-GB': 'Withdraw Funds',
    'el-GR': 'Ανάληψη Κεφαλαίων'
  },
  'wallet.managePaymentMethods': {
    'en-GB': 'Manage Payment Methods',
    'el-GR': 'Διαχείριση Μεθόδων Πληρωμής'
  },
  'wallet.transactionHistory': {
    'en-GB': 'Transaction History',
    'el-GR': 'Ιστορικό Συναλλαγών'
  },
  'wallet.quickSend': {
    'en-GB': 'Quick Send',
    'el-GR': 'Γρήγορη Αποστολή'
  },

  // Profile page translations
  'profile.title': {
    'en-GB': 'My Profile',
    'el-GR': 'Το Προφίλ μου'
  },
  'profile.personalInfo': {
    'en-GB': 'Personal Information',
    'el-GR': 'Προσωπικές Πληροφορίες'
  },
  'profile.accountSettings': {
    'en-GB': 'Account Settings',
    'el-GR': 'Ρυθμίσεις Λογαριασμού'
  },
  'profile.securitySettings': {
    'en-GB': 'Security Settings',
    'el-GR': 'Ρυθμίσεις Ασφαλείας'
  },
  'profile.changePassword': {
    'en-GB': 'Change Password',
    'el-GR': 'Αλλαγή Κωδικού'
  },
  'profile.twoFactorAuth': {
    'en-GB': 'Two-Factor Authentication',
    'el-GR': 'Ταυτοποίηση Δύο Παραγόντων'
  },
  'profile.privacySettings': {
    'en-GB': 'Privacy Settings',
    'el-GR': 'Ρυθμίσεις Απορρήτου'
  },
  'profile.accountActivity': {
    'en-GB': 'Account Activity',
    'el-GR': 'Δραστηριότητα Λογαριασμού'
  },
  'profile.deleteAccount': {
    'en-GB': 'Delete Account',
    'el-GR': 'Διαγραφή Λογαριασμού'
  },
  'profile.saveChanges': {
    'en-GB': 'Save Changes',
    'el-GR': 'Αποθήκευση Αλλαγών'
  },

  // Admin page translations
  'admin.title': {
    'en-GB': 'Administration Panel',
    'el-GR': 'Πίνακας Διαχείρισης'
  },
  'admin.userManagement': {
    'en-GB': 'User Management',
    'el-GR': 'Διαχείριση Χρηστών'
  },
  'admin.systemStats': {
    'en-GB': 'System Statistics',
    'el-GR': 'Στατιστικά Συστήματος'
  },
  'admin.transactionMonitoring': {
    'en-GB': 'Transaction Monitoring',
    'el-GR': 'Παρακολούθηση Συναλλαγών'
  },
  'admin.securityLogs': {
    'en-GB': 'Security Logs',
    'el-GR': 'Αρχεία Ασφαλείας'
  },
  'admin.systemHealth': {
    'en-GB': 'System Health',
    'el-GR': 'Υγεία Συστήματος'
  },
  'admin.backupRestore': {
    'en-GB': 'Backup & Restore',
    'el-GR': 'Αντίγραφα Ασφαλείας & Επαναφορά'
  },
  'admin.userActivity': {
    'en-GB': 'User Activity',
    'el-GR': 'Δραστηριότητα Χρηστών'
  },
  'admin.configureSystem': {
    'en-GB': 'Configure System',
    'el-GR': 'Διαμόρφωση Συστήματος'
  },

  // Issue Reporting page translations
  'issues.title': {
    'en-GB': 'Issue Reporting',
    'el-GR': 'Αναφορά Προβλημάτων'
  },
  'issues.reportIssue': {
    'en-GB': 'Report New Issue',
    'el-GR': 'Αναφορά Νέου Προβλήματος'
  },
  'issues.issueType': {
    'en-GB': 'Issue Type',
    'el-GR': 'Τύπος Προβλήματος'
  },
  'issues.issueDescription': {
    'en-GB': 'Issue Description',
    'el-GR': 'Περιγραφή Προβλήματος'
  },
  'issues.submitReport': {
    'en-GB': 'Submit Report',
    'el-GR': 'Υποβολή Αναφοράς'
  },
  'issues.myReports': {
    'en-GB': 'My Reports',
    'el-GR': 'Οι Αναφορές μου'
  },
  'issues.reportStatus': {
    'en-GB': 'Report Status',
    'el-GR': 'Κατάσταση Αναφοράς'
  },
  'issues.priority': {
    'en-GB': 'Priority',
    'el-GR': 'Προτεραιότητα'
  },
  'issues.assignedTo': {
    'en-GB': 'Assigned To',
    'el-GR': 'Ανατέθηκε σε'
  },

  // Send Money page translations
  'sendMoney.title': {
    'en-GB': 'Money Center',
    'el-GR': 'Κέντρο Χρημάτων'
  },
  'sendMoney.subtitle': {
    'en-GB': 'Send, request, add, or withdraw money',
    'el-GR': 'Αποστολή, αίτημα, προσθήκη ή ανάληψη χρημάτων'
  },
  'sendMoney.backToDashboard': {
    'en-GB': 'Back to Dashboard',
    'el-GR': 'Επιστροφή στον Πίνακα Ελέγχου'
  },
  'sendMoney.send': {
    'en-GB': 'Send',
    'el-GR': 'Αποστολή'
  },
  'sendMoney.request': {
    'en-GB': 'Request',
    'el-GR': 'Αίτημα'
  },
  'sendMoney.addMoney': {
    'en-GB': 'Add Money',
    'el-GR': 'Προσθήκη Χρημάτων'
  },
  'sendMoney.withdraw': {
    'en-GB': 'Withdraw',
    'el-GR': 'Ανάληψη'
  },
  'sendMoney.sendTo': {
    'en-GB': 'Send to',
    'el-GR': 'Αποστολή σε'
  },
  'sendMoney.amount': {
    'en-GB': 'Amount',
    'el-GR': 'Ποσό'
  },
  'sendMoney.note': {
    'en-GB': 'Note (Optional)',
    'el-GR': 'Σημείωση (Προαιρετική)'
  },
  'sendMoney.optional': {
    'en-GB': 'Optional',
    'el-GR': 'Προαιρετική'
  },
  'sendMoney.sendButton': {
    'en-GB': 'Send Money',
    'el-GR': 'Αποστολή Χρημάτων'
  },
  'sendMoney.recipientPlaceholder': {
    'en-GB': 'Email, phone number, or user ID',
    'el-GR': 'Email, τηλέφωνο ή ID χρήστη'
  },
  'sendMoney.amountPlaceholder': {
    'en-GB': '0.00',
    'el-GR': '0,00'
  },
  'sendMoney.notePlaceholder': {
    'en-GB': 'What\'s this for?',
    'el-GR': 'Για τι είναι αυτό;'
  },
  'sendMoney.requestFrom': {
    'en-GB': 'Request from',
    'el-GR': 'Αίτημα από'
  },
  'sendMoney.requestButton': {
    'en-GB': 'Request Money',
    'el-GR': 'Αίτημα Χρημάτων'
  },
  'sendMoney.addMoneyButton': {
    'en-GB': 'Add Money',
    'el-GR': 'Προσθήκη Χρημάτων'
  },
  'sendMoney.withdrawButton': {
    'en-GB': 'Withdraw Money',
    'el-GR': 'Ανάληψη Χρημάτων'
  },
  'sendMoney.source': {
    'en-GB': 'Payment Source',
    'el-GR': 'Πηγή Πληρωμής'
  },
  'sendMoney.destination': {
    'en-GB': 'Destination',
    'el-GR': 'Προορισμός'
  },
  'sendMoney.sourcePlaceholder': {
    'en-GB': 'Select payment method',
    'el-GR': 'Επιλέξτε μέθοδο πληρωμής'
  },
  'sendMoney.destinationPlaceholder': {
    'en-GB': 'Bank account or card',
    'el-GR': 'Τραπεζικός λογαριασμός ή κάρτα'
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

/**
 * useLanguage Hook - Access i18n context
 * 
 * Custom hook for accessing the internationalization context.
 * Provides language state and translation functionality to components.
 * 
 * @returns I18nContext containing language, setLanguage, and t function
 * @throws Error if used outside of I18nProvider
 */
export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
}