export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: ValidationRules;

  constructor(rules: ValidationRules) {
    this.rules = rules;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(value, rule);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateField(value: any, rule: ValidationRule): string | null {
    const stringValue = String(value || '').trim();

    // Required validation
    if (rule.required && !stringValue) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!stringValue && !rule.required) {
      return null;
    }

    // Email validation
    if (rule.email && !this.isValidEmail(stringValue)) {
      return 'Please enter a valid email address';
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return 'Please enter a valid value';
    }

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `Minimum length is ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `Maximum length is ${rule.maxLength} characters`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(stringValue);
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class CommonValidation {
  static email: ValidationRule = {
    required: true,
    email: true
  };

  static password: ValidationRule = {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number';
      }
      return null;
    }
  };

  static username: ValidationRule = {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  };

  static name: ValidationRule = {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  };

  static phone: ValidationRule = {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    minLength: 10,
    maxLength: 20
  };

  static amount: ValidationRule = {
    required: true,
    custom: (value: string) => {
      const amount = parseFloat(value);
      if (isNaN(amount) || amount <= 0) {
        return 'Please enter a valid amount';
      }
      if (amount > 1000000) {
        return 'Amount cannot exceed $1,000,000';
      }
      return null;
    }
  };

  static cardNumber: ValidationRule = {
    required: true,
    custom: (value: string) => {
      const cleaned = value.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) {
        return 'Please enter a valid card number';
      }
      return null;
    }
  };

  static cvv: ValidationRule = {
    required: true,
    pattern: /^\d{3,4}$/,
    custom: (value: string) => {
      if (value.length < 3 || value.length > 4) {
        return 'CVV must be 3 or 4 digits';
      }
      return null;
    }
  };

  static routingNumber: ValidationRule = {
    required: true,
    pattern: /^\d{9}$/,
    custom: (value: string) => {
      if (value.length !== 9) {
        return 'Routing number must be 9 digits';
      }
      return null;
    }
  };

  static accountNumber: ValidationRule = {
    required: true,
    pattern: /^\d{4,17}$/,
    custom: (value: string) => {
      if (value.length < 4 || value.length > 17) {
        return 'Account number must be 4-17 digits';
      }
      return null;
    }
  };
}

export class CurrencyFormatter {
  static format(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static parse(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  static formatInput(value: string): string {
    const number = this.parse(value);
    if (isNaN(number)) return '';
    return number.toFixed(2);
  }

  static formatDisplay(amount: number): string {
    return this.format(amount);
  }

  static calculatePercentage(amount: number, percentage: number): number {
    return (amount * percentage) / 100;
  }

  static addPercentage(amount: number, percentage: number): number {
    return amount + this.calculatePercentage(amount, percentage);
  }
}

export default FormValidator;