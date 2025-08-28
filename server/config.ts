/**
 * Domain Configuration for WhoopsPay and Juice Shop
 * Dynamically handles URLs based on environment
 *
 */

export interface DomainConfig {
  whoopspay: {
    domain: string;
    name: string;
  };
  juiceShop: {
    domain: string;
    name: string;
  };
}

export interface AppConfig {
  development: DomainConfig;
  production: DomainConfig;
  replit: DomainConfig;
  docker: DomainConfig;
}

const config: AppConfig = {
  development: {
    whoopspay: {
      domain: "http://localhost:5000",
      name: "WhoopsPay Local"
    },
    juiceShop: {
      domain: "http://localhost:3000",
      name: "Juice Shop Local"
    }
  },
  production: {
    whoopspay: {
      domain: "https://ff6ab99f-32cd-42a2-b4fe-059bb419c67c-00-zkb9coc4v3mb.riker.replit.dev",
      name: "WhoopsPay Replit"
    },
    juiceShop: {
      domain: "https://ff6ab99f-32cd-42a2-b4fe-059bb419c67c-00-zkb9coc4v3mb.riker.replit.dev/juice-shop",
      name: "Juice Shop Replit"
    }
  },
  replit: {
    whoopspay: {
      domain: "https://ff6ab99f-32cd-42a2-b4fe-059bb419c67c-00-zkb9coc4v3mb.riker.replit.dev",
      name: "WhoopsPay Replit"
    },
    juiceShop: {
      domain: "https://ff6ab99f-32cd-42a2-b4fe-059bb419c67c-00-zkb9coc4v3mb.riker.replit.dev/juice-shop",
      name: "Juice Shop Replit"
    }
  },
  docker: {
    whoopspay: {
      domain: process.env.WHOOPSPAY_URL || "http://localhost:3000",
      name: "WhoopsPay Docker"
    },
    juiceShop: {
      domain: process.env.JUICE_SHOP_URL || "http://localhost:3001",
      name: "Juice Shop Docker"
    }
  }
};

/**
 * Get current environment configuration
 */
export function getCurrentConfig(): DomainConfig {
  const env = process.env.NODE_ENV || 'development';
  const isReplit = process.env.REPLIT_DOMAINS || process.env.REPL_ID;
  const isDocker = process.env.WHOOPSPAY_URL || process.env.JUICE_SHOP_URL;
  
  // Determine environment
  if (isDocker && !isReplit) {
    return config.docker;
  } else if (isReplit) {
    return config.replit;
  } else if (env === 'production') {
    return config.production;
  } else {
    return config.development;
  }
}

/**
 * Get Juice Shop base URL for redirects
 */
export function getJuiceShopUrl(path: string = ''): string {
  const config = getCurrentConfig();
  return `${config.juiceShop.domain}${path}`;
}

/**
 * Get WhoopsPay base URL
 */
export function getWhoopsPayUrl(path: string = ''): string {
  const config = getCurrentConfig();
  return `${config.whoopspay.domain}${path}`;
}

/**
 * Log current configuration on startup
 */
export function logCurrentConfig(): void {
  const currentConfig = getCurrentConfig();
  console.log('🔧 Domain Configuration Loaded:');
  console.log(`   WhoopsPay: ${currentConfig.whoopspay.domain} (${currentConfig.whoopspay.name})`);
  console.log(`   Juice Shop: ${currentConfig.juiceShop.domain} (${currentConfig.juiceShop.name})`);
}

export default config;