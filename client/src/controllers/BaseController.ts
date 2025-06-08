import { BaseModel } from '../models/BaseModel';

export interface ControllerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface ControllerOptions {
  cache?: boolean;
  timeout?: number;
  retries?: number;
  validateInput?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export abstract class BaseController {
  protected defaultOptions: ControllerOptions = {
    cache: true,
    timeout: 30000,
    retries: 3,
    validateInput: true
  };

  protected cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  protected readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

  // Abstract methods to be implemented by child controllers
  protected abstract getModelClass(): typeof BaseModel;

  // Core CRUD operations
  async findAll(
    filters: FilterOptions = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('findAll', { filters, pagination });
      if (mergedOptions.cache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached.data, cached.metadata);
        }
      }

      // Build query options
      const queryOptions = this.buildQueryOptions(filters, pagination);
      
      // Execute query with retry logic
      const result = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        const [data, total] = await Promise.all([
          ModelClass.findAll(queryOptions),
          ModelClass.count({ filters })
        ]);
        
        return { data, total };
      }, mergedOptions.retries);

      // Calculate pagination metadata
      const metadata = this.calculatePaginationMetadata(
        result.total,
        pagination.page || 1,
        pagination.limit || 10
      );

      // Cache the result
      if (mergedOptions.cache) {
        this.setCache(cacheKey, { data: result.data, metadata });
      }

      return this.createSuccessResponse(result.data, metadata);

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async findById(
    id: string | number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Validate input
      if (mergedOptions.validateInput && !this.validateId(id)) {
        return this.createErrorResponse(new Error('Invalid ID format'));
      }

      // Check cache
      const cacheKey = this.generateCacheKey('findById', { id });
      if (mergedOptions.cache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached);
        }
      }

      // Execute query
      const result = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        return await ModelClass.findById(id);
      }, mergedOptions.retries);

      if (!result) {
        return this.createErrorResponse(new Error('Record not found'), 404);
      }

      // Cache the result
      if (mergedOptions.cache) {
        this.setCache(cacheKey, result);
      }

      return this.createSuccessResponse(result);

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async create(
    data: Record<string, any>,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Validate input
      if (mergedOptions.validateInput) {
        const validationResult = await this.validateCreateData(data);
        if (!validationResult.isValid) {
          return this.createErrorResponse(
            new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
          );
        }
      }

      // Process data before creation
      const processedData = await this.preprocessCreateData(data);

      // Execute creation
      const result = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        const instance = new ModelClass(processedData);
        return await instance.save();
      }, mergedOptions.retries);

      // Clear related caches
      this.clearRelatedCaches('create', result);

      // Post-process result
      const postProcessedResult = await this.postprocessCreateResult(result);

      return this.createSuccessResponse(
        postProcessedResult,
        undefined,
        'Record created successfully'
      );

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async update(
    id: string | number,
    data: Record<string, any>,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Validate input
      if (mergedOptions.validateInput) {
        if (!this.validateId(id)) {
          return this.createErrorResponse(new Error('Invalid ID format'));
        }

        const validationResult = await this.validateUpdateData(data, id);
        if (!validationResult.isValid) {
          return this.createErrorResponse(
            new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
          );
        }
      }

      // Find existing record
      const existing = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        return await ModelClass.findById(id);
      }, mergedOptions.retries);

      if (!existing) {
        return this.createErrorResponse(new Error('Record not found'), 404);
      }

      // Process data before update
      const processedData = await this.preprocessUpdateData(data, existing);

      // Execute update
      const result = await this.executeWithRetry(async () => {
        existing.setAttributes(processedData);
        return await existing.save();
      }, mergedOptions.retries);

      // Clear related caches
      this.clearRelatedCaches('update', result);

      // Post-process result
      const postProcessedResult = await this.postprocessUpdateResult(result);

      return this.createSuccessResponse(
        postProcessedResult,
        undefined,
        'Record updated successfully'
      );

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async delete(
    id: string | number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Validate input
      if (mergedOptions.validateInput && !this.validateId(id)) {
        return this.createErrorResponse(new Error('Invalid ID format'));
      }

      // Find existing record
      const existing = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        return await ModelClass.findById(id);
      }, mergedOptions.retries);

      if (!existing) {
        return this.createErrorResponse(new Error('Record not found'), 404);
      }

      // Check if deletion is allowed
      const canDelete = await this.canDelete(existing);
      if (!canDelete.allowed) {
        return this.createErrorResponse(new Error(canDelete.reason || 'Deletion not allowed'));
      }

      // Execute deletion
      await this.executeWithRetry(async () => {
        return await existing.delete();
      }, mergedOptions.retries);

      // Clear related caches
      this.clearRelatedCaches('delete', existing);

      // Post-process deletion
      await this.postprocessDeleteResult(existing);

      return this.createSuccessResponse(
        null,
        undefined,
        'Record deleted successfully'
      );

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Search functionality
  async search(
    query: string,
    filters: FilterOptions = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Validate search query
      if (!query || query.trim().length < 2) {
        return this.createErrorResponse(new Error('Search query must be at least 2 characters'));
      }

      // Check cache
      const cacheKey = this.generateCacheKey('search', { query, filters, pagination });
      if (mergedOptions.cache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached.data, cached.metadata);
        }
      }

      // Build search filters
      const searchFilters = this.buildSearchFilters(query, filters);
      const queryOptions = this.buildQueryOptions(searchFilters, pagination);

      // Execute search
      const result = await this.executeWithRetry(async () => {
        const ModelClass = this.getModelClass();
        const [data, total] = await Promise.all([
          ModelClass.findAll(queryOptions),
          ModelClass.count({ filters: searchFilters })
        ]);
        
        return { data, total };
      }, mergedOptions.retries);

      // Calculate pagination metadata
      const metadata = this.calculatePaginationMetadata(
        result.total,
        pagination.page || 1,
        pagination.limit || 10
      );

      // Cache the result
      if (mergedOptions.cache) {
        this.setCache(cacheKey, { data: result.data, metadata });
      }

      return this.createSuccessResponse(result.data, metadata);

    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Utility methods
  protected buildQueryOptions(filters: FilterOptions, pagination: PaginationOptions) {
    return {
      filters,
      sort: pagination.sort,
      order: pagination.order,
      limit: pagination.limit || 10,
      offset: ((pagination.page || 1) - 1) * (pagination.limit || 10)
    };
  }

  protected buildSearchFilters(query: string, additionalFilters: FilterOptions = {}): FilterOptions {
    // Default implementation - should be overridden by child controllers
    return {
      ...additionalFilters,
      $or: [
        { name: { $like: `%${query}%` } },
        { description: { $like: `%${query}%` } }
      ]
    };
  }

  protected calculatePaginationMetadata(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  protected validateId(id: string | number): boolean {
    if (typeof id === 'number') {
      return id > 0;
    }
    
    if (typeof id === 'string') {
      return id.trim().length > 0;
    }
    
    return false;
  }

  // Cache management
  protected generateCacheKey(operation: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${this.constructor.name}:${operation}:${JSON.stringify(sortedParams)}`;
  }

  protected getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  protected setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  protected clearRelatedCaches(operation: string, model: any): void {
    // Clear all caches related to this model type
    const modelName = this.constructor.name;
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.startsWith(modelName)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Response helpers
  protected createSuccessResponse(
    data: any,
    metadata?: any,
    message?: string
  ): ControllerResponse {
    return {
      success: true,
      data,
      metadata,
      message
    };
  }

  protected createErrorResponse(error: any, statusCode?: number): ControllerResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      success: false,
      error: errorMessage,
      metadata: statusCode ? { statusCode } : undefined
    };
  }

  // Retry logic
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError!;
  }

  // Validation hooks (to be overridden by child controllers)
  protected async validateCreateData(data: Record<string, any>): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    // Default implementation - should be overridden
    return { isValid: true, errors: {} };
  }

  protected async validateUpdateData(
    data: Record<string, any>,
    id: string | number
  ): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    // Default implementation - should be overridden
    return { isValid: true, errors: {} };
  }

  // Data processing hooks (to be overridden by child controllers)
  protected async preprocessCreateData(data: Record<string, any>): Promise<Record<string, any>> {
    return data;
  }

  protected async preprocessUpdateData(
    data: Record<string, any>,
    existing: any
  ): Promise<Record<string, any>> {
    return data;
  }

  protected async postprocessCreateResult(result: any): Promise<any> {
    return result;
  }

  protected async postprocessUpdateResult(result: any): Promise<any> {
    return result;
  }

  protected async postprocessDeleteResult(deleted: any): Promise<void> {
    // Default implementation - override if needed
  }

  // Permission checking (to be overridden by child controllers)
  protected async canDelete(model: any): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}