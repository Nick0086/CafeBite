export const customerMenuQueryKeys = {
    TEMPLATE: 'customer-menu-template',
    CATEGORIES: 'customer-menu-categories',
    MENU_ITEMS: 'customer-menu-items',
};

export const DEFAULT_MENU_OPTIONS = {
    enableVirtualization: true,
    enableImagePreloading: true,
    enablePerformanceMonitoring: import.meta.env.DEV,
    virtualConfig: {
        containerHeight: 600,
        itemWidth: 320,
        itemHeight: 420,
        columnCount: 3,
    },
    preloadOptions: {
        batchSize: 8,
        priority: 'visible',
    },
};

export const DEFAULT_INITIAL_RENDER_BATCH = 9;
export const RENDER_BATCH_INCREMENT = 6;
export const RENDER_BATCH_MAX = 12;
