import React from 'react';
import CustomerMenuViewer from '@/components/CustomerMenu/CustomerMenuViewer';

const MenuPage = ({ menuConfig }) => {
    const menuOptions = {
        enableVirtualization: true, // Enable for large menus (>50 items per category)
        enableImagePreloading: true,
        enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
        
        virtualConfig: {
            containerHeight: 600,
            itemWidth: 320,
            itemHeight: 420,
            columnCount: 3
        },
        
        preloadOptions: {
            batchSize: 8,
            priority: 'visible' // 'visible', 'all', 'none'
        }
    };

    return (
        <div className="menu-page">
            <CustomerMenuViewer 
                menuConfig={menuConfig} 
                options={menuOptions}
            />
        </div>
    );
};

export default MenuPage;