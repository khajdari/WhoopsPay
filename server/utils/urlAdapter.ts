import { getCurrentConfig } from '../config';

/**
 * URL Adapter - Dynamically adapts URLs based on current environment
 * Converts localhost URLs to appropriate domain for current environment
 */
export class URLAdapter {
  private static config = getCurrentConfig();

  /**
   * Adapts external URLs to current environment
   * Replaces localhost:3000 with appropriate Juice Shop domain
   * Replaces localhost:5000 with appropriate WhoopsPay domain
   */
  static adaptExternalUrl(url: string): string {
    if (!url) return url;

    // Replace Juice Shop localhost URLs
    const juiceShopRegex = /http:\/\/localhost:3000/g;
    if (juiceShopRegex.test(url)) {
      return url.replace(juiceShopRegex, this.config.juiceShop.domain);
    }

    // Replace WhoopsPay localhost URLs
    const whoopsPayRegex = /http:\/\/localhost:5000/g;
    if (whoopsPayRegex.test(url)) {
      return url.replace(whoopsPayRegex, this.config.whoopspay.domain);
    }

    return url;
  }

  /**
   * Adapts return/cancel URLs for external payment requests
   * Ensures URLs point to correct domain based on environment
   */
  static adaptPaymentUrls(returnUrl?: string, cancelUrl?: string): {
    returnUrl?: string;
    cancelUrl?: string;
  } {
    return {
      returnUrl: returnUrl ? this.adaptExternalUrl(returnUrl) : undefined,
      cancelUrl: cancelUrl ? this.adaptExternalUrl(cancelUrl) : undefined
    };
  }

  /**
   * Get current Juice Shop domain
   */
  static getJuiceShopDomain(): string {
    return this.config.juiceShop.domain;
  }

  /**
   * Get current WhoopsPay domain
   */
  static getWhoopsPayDomain(): string {
    return this.config.whoopspay.domain;
  }

  /**
   * Build Juice Shop URL with path
   */
  static buildJuiceShopUrl(path: string): string {
    const domain = this.getJuiceShopDomain();
    return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  /**
   * Build WhoopsPay URL with path
   */
  static buildWhoopsPayUrl(path: string): string {
    const domain = this.getWhoopsPayDomain();
    return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}