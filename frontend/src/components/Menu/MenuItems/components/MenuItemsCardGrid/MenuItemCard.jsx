import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { SquarePen } from 'lucide-react';
import { CachedImage } from '@/components/ui/CachedImage';
import { imageCache } from '@/lib/ImageCacheService';
import { VegStatusBadge } from '@/common/StatusBadge';

const OptimizedImage = ({ src, alt }) => {
    const { ref, inView } = useInView({ threshold: 0.1, rootMargin: '150px' });
    return (
        <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
            {inView ? (
                <CachedImage
                    src={src}
                    alt={alt || 'Menu Items'}
                    className="w-full h-full object-cover"
                    width={400}
                    height={224}
                    quality={0.8}
                    lazy={false}
                    placeholder={true}
                />
            ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default function MenuItemCard({ item, onEdit, currencySymbol }) {
    const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true, rootMargin: '100px 0px' });
    const mountedRef = useRef(true);

    useEffect(() => () => { mountedRef.current = false; }, []);

    useEffect(() => {
        if (inView && item?.image_details?.url) {
            imageCache
                .preloadImage(item.image_details.url, { width: 400, height: 224, quality: 0.8 })
                .catch((err) => { if (mountedRef.current) console.warn('Failed to preload image:', item.image_details.url, err); });
        }
    }, [inView, item?.image_details?.url]);

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card className="flex flex-col justify-between overflow-hidden h-full relative">
                    <div className="absolute top-2 left-2 z-[1] p-1">
                        <VegStatusBadge type={item?.veg_status} />
                    </div>
                    <Button
                        onClick={onEdit}
                        className="absolute top-2 right-2 z-[1] p-1"
                        variant="primary"
                        size="xs"
                    >
                        <SquarePen size={16} />
                    </Button>

                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} />

                    <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-lg text-primary">{item?.name}</CardTitle>
                            <CardDescription className="text-secondary">{item?.description}</CardDescription>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold flex items-center gap-1">
                                {currencySymbol} {item?.price}
                            </span>
                            <div className="flex items-center gap-1">
                                {item.availability === 'in_stock' ? (
                                    <Chip variant="light" color="green" radius="md" size="xs">In Stock</Chip>
                                ) : (
                                    <Chip variant="light" color="red" radius="md" size="xs">Out of Stock</Chip>
                                )}
                                {item.status ? (
                                    <Chip variant="light" color="green" radius="md" size="xs">Active</Chip>
                                ) : (
                                    <Chip variant="light" color="red" radius="md" size="xs">Inactive</Chip>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );
}
