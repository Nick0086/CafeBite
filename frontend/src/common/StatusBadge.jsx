import { memo } from 'react';
import { Chip } from '@/components/ui/chip';
import { AppTooltip } from '@/common/AppTooltip';
import { cn } from '@/lib/utils';

export const VegStatusBadge = memo(function VegStatusBadge({ type }) {
    const isVeg = type === 'veg';
    return (
        <AppTooltip content={isVeg ? 'Veg' : 'Non Veg'}>
            <Chip
                className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center'
                variant='outline'
                radius='md'
                size='sm'
                color={isVeg ? 'green' : 'red'}
            >
                <div
                    className={cn(
                        'h-3 w-3 rounded-full',
                        isVeg ? 'bg-green-500' : 'bg-red-500',
                    )}
                />
            </Chip>
        </AppTooltip>
    );
});
