import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import React, { useState, useEffect, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Plus, SquarePen } from 'lucide-react';
import MenuFilters from './components/MenuCardFilters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { CachedImage } from '@/components/ui/CachedImage';
import { imageCache } from '@/services/ImageCacheService';
import { BlobHealthChecker } from '@/utils/blobHealthCheck';

// Enhanced image component with caching
const OptimizedImage = memo(({ src, alt, t }) => {
  const { ref, inView } = useInView({ threshold: 0.1, rootMargin: '150px' });

  return (
    <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
      {inView ? (
        <CachedImage src={src} alt={alt || t('menu_items')} className="w-full h-full object-cover" width={400} height={224} quality={0.8} lazy={false} placeholder={true} />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      )}
    </div>
  );
});

function StatusBadge({ type, t }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
            <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
          </Chip>
        </TooltipTrigger>
        <TooltipContent className='z-50' >
          <p>{type === "veg" ? t("veg") : t("non_veg")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Individual menu item card with intersection observer and image preloading
const MenuItem = memo(({ item, setIsModalOpen, t }) => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true, rootMargin: '100px 0px' });

  // Preload image when item comes into view
  useEffect(() => {
    if (inView && item?.image_details?.url) {
      // Preload image in background for faster subsequent loads
      imageCache.preloadImage(item.image_details.url, { width: 400, height: 224, quality: 0.8 }).catch(error => {
        console.warn('Failed to preload image:', item.image_details.url, error);
      });
    }
  }, [inView, item?.image_details?.url]);

  return (
    <div ref={ref} className="h-full">
      {inView ? (
        <Card className="flex flex-col justify-between overflow-hidden h-full relative">
          <div className='absolute top-2 left-2 z-[1] p-1'>
            <StatusBadge type={item?.veg_status} t={t} />
          </div>
          <Button onClick={() => { setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: true, data: item, isDirect: false })) }} className='absolute top-2 right-2 z-[1] p-1' variant="primary" size="xs">
            <SquarePen size={16} />
          </Button>

          <OptimizedImage src={item?.image_details?.url} alt={item?.name} t={t} />

          <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg text-primary">{item?.name}</CardTitle>
              <CardDescription className="text-secondary">{item?.description}</CardDescription>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold">${item?.price}</span>
              <div className='flex items-center gap-1'>
                {item.availability === 'in_stock' ? (
                  <Chip variant="light" color="green" radius="md" size="xs">{t("In_Stock")}</Chip>
                ) : (
                  <Chip variant="light" color="red" radius="md" size="xs">{t("Out_of_Stock")}</Chip>
                )}
                <Separator orientation='vertical' className='h-5 w-0.5' />
                {item.status ? (
                  <Chip variant="light" color="green" radius="md" size="xs">{t("active")}</Chip>
                ) : (
                  <Chip variant="light" color="red" radius="md" size="xs">{t('inactive')}</Chip>
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
});

// Hook for preloading category images
const useCategoryImagePreloader = (groupedItems) => {
  useEffect(() => {
    const preloadCategoryImages = async () => {
      const imageUrls = [];

      // Collect all image URLs from grouped items
      Object.values(groupedItems).forEach(items => {
        items.forEach(item => {
          if (item?.image_details?.url) {
            imageUrls.push(item.image_details.url);
          }
        });
      });

      if (imageUrls.length === 0) return;

      // Preload in batches of 5
      const batchSize = 5;
      for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);

        try {
          await imageCache.preloadImages(batch, { width: 400, height: 224, quality: 0.8 });

          // Small delay between batches
          if (i + batchSize < imageUrls.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn('Batch preload failed:', error);
        }
      }
    };

    // Start preloading after a short delay to allow initial render
    const timer = setTimeout(preloadCategoryImages, 1000);
    return () => clearTimeout(timer);
  }, [groupedItems]);
};

export default function MenuCard({ data, isLoading, setIsModalOpen, categoryOptions }) {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [menuAvailability, setMenuAvailability] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectFoodType, setSelectFoodType] = useState([]);

  useEffect(() => {
    if (data?.menuItems) {
      setMenuItems(data?.menuItems);
    }
  }, [data]);

  // Add blob health check in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && menuItems.length > 0) {
      const healthCheck = async () => {
        try {
          const integrity = await BlobHealthChecker.validateCacheIntegrity();
          if (integrity.invalid > 0) {
            console.warn(`🔧 Found ${integrity.invalid} corrupted blobs, repairing...`);
            await BlobHealthChecker.repairCorruptedBlobs();
          }
        } catch (error) {
          console.error('Blob health check failed:', error);
        }
      };

      const timer = setTimeout(healthCheck, 3000);
      return () => clearTimeout(timer);
    }
  }, [menuItems]);

  // Filtered menu items based on search query and selected categories
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesAvailability = menuAvailability.length === 0 || menuAvailability.includes(item.availability);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_name);
    const matchFoodType = selectFoodType.length === 0 || selectFoodType.includes(item.veg_status);

    return matchesSearch && matchesStatus && matchesAvailability && matchesCategory && matchFoodType;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category_name || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Preload images for visible categories
  useCategoryImagePreloader(groupedItems);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setMenuAvailability([]);
    setSelectedCategories([]);
    setSelectFoodType([]);
  };

  // Loading skeleton with better image placeholders
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={`loading-${index}`} className="flex flex-col justify-between overflow-hidden">
            <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <CardContent className="p-4 pt-0">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className='flex items-center justify-center w-full h-[60dvh]'>
        <p className='text-xl font-semibold text-primary'>{t("No_menu_items_found")}</p>
      </div>
    );
  }

  return (
    <>
      <MenuFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedStatuses={selectedStatuses} setSelectedStatuses={setSelectedStatuses} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} menuAvailability={menuAvailability} setMenuAvailability={setMenuAvailability} categoryOptions={categoryOptions} resetFilters={resetFilters} setSelectFoodType={setSelectFoodType} selectFoodType={selectFoodType}
      />

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="pb-6 mb-4 border-b-2 border-dashed border-indigo-300 px-2">
          <div className="flex items-center justify-between bg-muted/80 p-3 rounded-md mb-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block"></div>
              <h2 className="text-xl font-semibold">{category}</h2>
              <Chip variant="light" color="slate" radius="md" size="xs">
                {items.length} {items.length === 1 ? t("item") : t('items')}
              </Chip>
            </div>
            <Button onClick={() => setIsModalOpen((prev) => ({ ...prev, isDirect: true, isOpen: true, isEdit: false, data: { name: "", description: "", price: "", cover_image: "", category_id: items[0]?.category_id, status: 1, availability: "in_stock" } }))}
              className="!text-xs text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500" size="xs" >
              <Plus size={14} /> {t("add_to")} {category}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {items?.map((item) => (
              <MenuItem key={item.unique_id || item.id} item={item} setIsModalOpen={setIsModalOpen} t={t} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}