import React, { memo, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CachedImage } from '../ui/CachedImage';
import { AppTooltip } from '@/common/AppTooltip';
import { Chip } from '../ui/chip';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { useOrder } from '@/contexts/order-management-context';
import { useTranslation } from 'react-i18next';

const StatusBadge = memo(({ type }) => (
    <AppTooltip content={type === "veg" ? "Veg" : "Non Veg"}>
        <Chip
            className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center'
            variant='outline'
            radius='md'
            size='sm'
            color={type === "veg" ? 'green' : 'red'}
        >
            <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
        </Chip>
    </AppTooltip>
));

const QuantityControls = memo(({ item, itemInOrder, onAdd, onRemove, isInStock, styles }) => (
    <div className='flex items-center gap-x-1'>
        <Button
            disabled={!isInStock}
            style={styles?.buttonBackgroundStyle}
            variant='primary'
            size='icon'
            onClick={onRemove}
            className="flex items-center gap-1"
        >
            <Minus size={14} style={styles?.buttonLabelStyle} />
        </Button>

        <Chip
            className='gap-1 w-8 h-8 bg-white p-0 flex items-center justify-center'
            variant='outline'
            radius='md'
            size='sm'
            color='gray'
        >
            {itemInOrder.quantity}
        </Chip>

        <Button
            disabled={!isInStock}
            style={styles?.buttonBackgroundStyle}
            variant='primary'
            size='icon'
            onClick={onAdd}
            className="flex items-center gap-1"
        >
            <Plus size={14} style={styles?.buttonLabelStyle} />
        </Button>
    </div>
));

const StockStatus = memo(({ isInStock, t }) => (
    <Chip
        variant="light"
        color={isInStock ? "green" : "red"}
        radius="md"
        size="xs"
    >
        {isInStock ? t("In_Stock") : t("Out_of_Stock")}
    </Chip>
));

const OptimizedMenuItem = memo(({ item, styles }) => {
    const { t } = useTranslation();
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '100px 0px',
    });

    const { addItem, removeItem, orderItems } = useOrder();

    // Memoize computed values
    const computedValues = useMemo(() => {
        const isInStock = item.availability === 'in_stock';
        const itemInOrder = orderItems.find(orderItem =>
            orderItem.id === item.id || orderItem.unique_id === item.unique_id
        );
        const price = parseFloat(item.price);

        return { isInStock, itemInOrder, price };
    }, [item.availability, item.id, item.unique_id, item.price, orderItems]);

    const { isInStock, itemInOrder, price } = computedValues;

    // Memoize handlers
    const handlers = useMemo(() => ({
        handleAddToOrder: () => {
            if (isInStock) {
                addItem({
                    id: item.id,
                    unique_id: item.unique_id,
                    name: item.name,
                    price,
                    veg_status: item.veg_status,
                    image: item.image_details?.url
                });
            }
        },
        handleRemoveFromOrder: () => removeItem(item)
    }), [isInStock, addItem, removeItem, item, price]);

    if (!inView) {
        return (
            <div ref={ref} className="w-full h-96 bg-gray-100 rounded-lg animate-pulse"/>
        );
    }

    return (
        <div ref={ref} className="h-full">
            <Card
                style={styles?.cardStyle}
                className="flex flex-col justify-between overflow-hidden h-full relative group"
            >
                <div className='absolute top-2 right-2 z-[1]'>
                    <StatusBadge type={item?.veg_status} />
                </div>

                <CachedImage
                    src={item?.image_details?.url}
                    alt={item?.name}
                    className="w-full h-56 rounded-lg"
                    width={400}
                    height={224}
                    quality={0.8}
                />

                <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                    <div className="flex flex-col gap-1">
                        <CardTitle
                            style={styles?.titleStyle}
                            className="text-lg text-primary"
                        >
                            {item?.name}
                        </CardTitle>
                        <CardDescription
                            style={styles?.descriptionStyle}
                            className="text-secondary line-clamp-2"
                        >
                            {item?.description}
                        </CardDescription>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <span
                            style={styles?.titleStyle}
                            className="text-base font-bold"
                        >
                            ${price.toFixed(2)}
                        </span>

                        {itemInOrder ? (
                            <QuantityControls
                                item={item}
                                itemInOrder={itemInOrder}
                                onAdd={handlers.handleAddToOrder}
                                onRemove={handlers.handleRemoveFromOrder}
                                isInStock={isInStock}
                                styles={styles}
                            />
                        ) : (
                            <StockStatus isInStock={isInStock} t={t} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

OptimizedMenuItem.displayName = 'OptimizedMenuItem';

export { OptimizedMenuItem };