import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());
    const performanceData = useRef({
        renders: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        totalRenderTime: 0
    });

    const logPerformance = useCallback(() => {
        const now = Date.now();
        const renderTime = now - lastRenderTime.current;
        
        renderCount.current += 1;
        performanceData.current.renders = renderCount.current;
        performanceData.current.totalRenderTime += renderTime;
        performanceData.current.averageRenderTime = 
            performanceData.current.totalRenderTime / renderCount.current;
        performanceData.current.maxRenderTime = 
            Math.max(performanceData.current.maxRenderTime, renderTime);

        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
            console.warn(`${componentName} slow render: ${renderTime}ms`);
        }

        lastRenderTime.current = now;
    }, [componentName]);

    useEffect(() => {
        logPerformance();
    });

    const getPerformanceStats = useCallback(() => ({
        ...performanceData.current,
        componentName
    }), [componentName]);

    return { getPerformanceStats };
};