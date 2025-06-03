import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react';

export type Language = 'en-GB' | 'el-GR';

interface TranslationKey {
  'en-GB': string;
  'el-GR': string;
}

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

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('paypal-language');
    return (saved as Language) || 'en-GB';
  });

  useEffect(() => {
    localStorage.setItem('paypal-language', language);
  }, [language]);

  const t = (key: keyof Translations): string => {
    return translations[key][language] || translations[key]['en-GB'];
  };

  const value = { language, setLanguage, t };

  return createElement(I18nContext.Provider, { value }, children);
}