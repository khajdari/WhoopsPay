import { apiRequest } from "@/lib/queryClient";

export interface ModelValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ModelValidationSchema {
  [field: string]: ModelValidationRule;
}

export interface ModelValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface QueryOptions {
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface ModelMetadata {
  tableName: string;
  primaryKey: string;
  relationships?: Record<string, {
    type: 'hasMany' | 'belongsTo' | 'hasOne';
    model: string;
    foreignKey?: string;
  }>;
}

export abstract class BaseModel {
  protected static metadata: ModelMetadata;
  protected static validationSchema: ModelValidationSchema = {};
  
  protected data: Record<string, any> = {};
  protected originalData: Record<string, any> = {};
  protected isDirty: boolean = false;
  protected isNew: boolean = true;

  constructor(data: Record<string, any> = {}) {
    this.data = { ...data };
    this.originalData = { ...data };
    this.isNew = !data[this.getPrimaryKey()];
  }

  // Abstract methods to be implemented by child classes
  protected abstract getMetadata(): ModelMetadata;
  protected abstract getValidationSchema(): ModelValidationSchema;

  // Core CRUD operations
  static async findAll<T extends BaseModel>(
    this: new (data: any) => T,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const metadata = (this as any).metadata;
    const queryParams = this.buildQueryParams(options);
    const endpoint = `/api/${metadata.tableName}${queryParams}`;
    
    const response = await apiRequest(endpoint, "GET");
    return (response || []).map((item: any) => new this(item));
  }

  static async findById<T extends BaseModel>(
    this: new (data: any) => T,
    id: string | number
  ): Promise<T | null> {
    const metadata = (this as any).metadata;
    const endpoint = `/api/${metadata.tableName}/${id}`;
    
    try {
      const response = await apiRequest(endpoint, "GET");
      return response ? new this(response) : null;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  static async findOne<T extends BaseModel>(
    this: new (data: any) => T,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const results = await this.findAll({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  static async count(options: QueryOptions = {}): Promise<number> {
    const metadata = (this as any).metadata;
    const queryParams = this.buildQueryParams({ ...options, count: true });
    const endpoint = `/api/${metadata.tableName}/count${queryParams}`;
    
    const response = await apiRequest(endpoint, "GET");
    return response?.count || 0;
  }

  // Instance methods
  async save(): Promise<this> {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const metadata = this.getMetadata();
    
    if (this.isNew) {
      const response = await apiRequest(`/api/${metadata.tableName}`, "POST", this.data);
      this.data = { ...response };
      this.originalData = { ...response };
      this.isNew = false;
    } else {
      const id = this.data[metadata.primaryKey];
      const changes = this.getChanges();
      
      if (Object.keys(changes).length > 0) {
        const response = await apiRequest(`/api/${metadata.tableName}/${id}`, "PUT", changes);
        this.data = { ...this.data, ...response };
        this.originalData = { ...this.data };
      }
    }
    
    this.isDirty = false;
    return this;
  }

  async delete(): Promise<boolean> {
    if (this.isNew) {
      throw new Error("Cannot delete unsaved model");
    }

    const metadata = this.getMetadata();
    const id = this.data[metadata.primaryKey];
    
    await apiRequest(`/api/${metadata.tableName}/${id}`, "DELETE");
    return true;
  }

  async reload(): Promise<this> {
    if (this.isNew) {
      throw new Error("Cannot reload unsaved model");
    }

    const metadata = this.getMetadata();
    const id = this.data[metadata.primaryKey];
    const response = await apiRequest(`/api/${metadata.tableName}/${id}`, "GET");
    
    this.data = { ...response };
    this.originalData = { ...response };
    this.isDirty = false;
    
    return this;
  }

  // Validation methods
  validate(): ModelValidationResult {
    const schema = this.getValidationSchema();
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = this.data[field];
      const error = this.validateField(value, rule, field);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  protected validateField(value: any, rule: ModelValidationRule, fieldName: string): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(value, rule.type, fieldName);
      if (typeError) return typeError;
    }

    // Length validations for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${fieldName} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${fieldName} must be no more than ${rule.maxLength} characters`;
      }
    }

    // Numeric validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${fieldName} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `${fieldName} must be no more than ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  protected validateType(value: any, type: string, fieldName: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${fieldName} must be a string`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${fieldName} must be a number`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${fieldName} must be a boolean`;
        }
        break;
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailPattern.test(value)) {
          return `${fieldName} must be a valid email address`;
        }
        break;
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return `${fieldName} must be a valid date`;
        }
        break;
    }
    return null;
  }

  // Data access methods
  get<T = any>(field: string): T {
    return this.data[field];
  }

  set(field: string, value: any): this {
    if (this.data[field] !== value) {
      this.data[field] = value;
      this.isDirty = true;
    }
    return this;
  }

  setAttributes(attributes: Record<string, any>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this.set(key, value);
    }
    return this;
  }

  getAttributes(): Record<string, any> {
    return { ...this.data };
  }

  getChanges(): Record<string, any> {
    const changes: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(this.data)) {
      if (this.originalData[key] !== value) {
        changes[key] = value;
      }
    }
    
    return changes;
  }

  hasChanges(): boolean {
    return this.isDirty;
  }

  getPrimaryKey(): string {
    return this.getMetadata().primaryKey;
  }

  getId(): any {
    return this.data[this.getPrimaryKey()];
  }

  isNewRecord(): boolean {
    return this.isNew;
  }

  isPersisted(): boolean {
    return !this.isNew;
  }

  // Relationship methods
  async loadRelation(relationName: string): Promise<any> {
    const metadata = this.getMetadata();
    const relation = metadata.relationships?.[relationName];
    
    if (!relation) {
      throw new Error(`Relationship '${relationName}' not defined`);
    }

    const id = this.getId();
    const endpoint = `/api/${metadata.tableName}/${id}/${relationName}`;
    
    const response = await apiRequest(endpoint, "GET");
    return response;
  }

  // Static helper methods
  protected static buildQueryParams(options: QueryOptions): string {
    const params = new URLSearchParams();
    
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        params.append(`filter[${key}]`, String(value));
      }
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    }
    
    if (options.order) {
      params.append('order', options.order);
    }
    
    if (options.limit) {
      params.append('limit', String(options.limit));
    }
    
    if (options.offset) {
      params.append('offset', String(options.offset));
    }
    
    if (options.include) {
      params.append('include', options.include.join(','));
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Utility methods
  toJSON(): Record<string, any> {
    return { ...this.data };
  }

  toString(): string {
    return JSON.stringify(this.data, null, 2);
  }

  clone(): this {
    const Constructor = this.constructor as new (data: any) => this;
    return new Constructor(this.data);
  }
}