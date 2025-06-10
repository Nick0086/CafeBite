import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedMenuItem } from './OptimizedMenuItem';

const VirtualizedMenuGrid = memo(({ 
    items, 
    styles, 
    containerHeight = 600,
    itemWidth = 300,
    itemHeight = 400,
    columnCount = 3 
}) => {
    const gridItems = useMemo(() => {
        const result = [];
        for (let i = 0; i < items.length; i += columnCount) {
            result.push(items.slice(i, i + columnCount));
        }
        return result;
    }, [items, columnCount]);

    const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
        const item = gridItems[rowIndex]?.[columnIndex];
        
        if (!item) {
            return <div style={style} />;
        }

        return (
            <div style={{ ...style, padding: '8px' }}>
                <OptimizedMenuItem item={item} styles={styles} />
            </div>
        );
    }, [gridItems, styles]);

    const rowCount = Math.ceil(items.length / columnCount);

    return (
        <Grid
            columnCount={columnCount}
            columnWidth={itemWidth}
            height={containerHeight}
            rowCount={rowCount}
            rowHeight={itemHeight}
            width="100%"
            overscanRowCount={2}
            overscanColumnCount={1}
        >
            {Cell}
        </Grid>
    );
});

VirtualizedMenuGrid.displayName = 'VirtualizedMenuGrid';

export { VirtualizedMenuGrid };