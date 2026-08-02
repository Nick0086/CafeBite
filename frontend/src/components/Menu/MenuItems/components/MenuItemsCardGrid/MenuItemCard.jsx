import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { SquarePen, ImageIcon } from 'lucide-react';
import { CachedImage } from '@/components/ui/CachedImage';
import { imageCache } from '@/lib/ImageCacheService';
import { VegStatusBadge } from '@/common/StatusBadge';
import { useMenuItemImageUrl } from '../../hooks/useMenuItemsData';

const ImageThumb = ({ item }) => {
    const { ref: imageRef, inView: imageInView } = useInView({ threshold: 0.1, rootMargin: '150px' });
    const hasImage = !!(item?.image_details?.path);
    const { data: imageData, isLoading } = useMenuItemImageUrl(item?.unique_id, { enabled: hasImage && imageInView });
    const imageUrl = imageData?.imageUrl;

    const mountedRef = useRef(true);
    useEffect(() => () => { mountedRef.current = false; }, []);

    useEffect(() => {
        if (imageUrl) {
            imageCache
                .preloadImage(imageUrl, { width: 400, height: 224, quality: 0.8 })
                .catch(() => { if (mountedRef.current) console.warn('Failed to preload image:', imageUrl); });
        }
    }, [imageUrl]);

    return (
        <div ref={imageRef} className="w-full h-56 rounded-lg overflow-hidden">
            {!hasImage ? (
                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                    <span className="text-xs text-gray-400">No image</span>
                </div>
            ) : !imageInView || isLoading || !imageUrl ? (
                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 relative animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200/50 to-gray-100" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/70 shadow-sm flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                            {!imageInView ? 'Scroll to load' : 'Image loading'}
                        </span>
                    </div>
                </div>
            ) : (
                <CachedImage
                    src={imageUrl}
                    alt={item?.name || 'Menu Items'}
                    className="w-full h-full object-cover"
                    width={400}
                    height={224}
                    quality={0.8}
                    lazy={false}
                    placeholder={true}
                />
            )}
        </div>
    );
};

export default function MenuItemCard({ item, onEdit, currencySymbol }) {
    const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true, rootMargin: '100px 0px' });

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

                    <ImageThumb item={item} />

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
