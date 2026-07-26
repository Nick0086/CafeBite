import { useQuery } from '@tanstack/react-query';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import ImageAvatar from '@/components/ui/ImageAvatar';
import {
    MENU_ITEM_FOOD_OPTIONS,
    MENU_ITEM_STATUS_OPTIONS,
    MENU_ITEM_STOCK_OPTIONS,
} from '../../constants/menuItem.constants';
import { categoryQueryKeys } from '../../../Categories/constants/category.constants';
import { getAllCategory } from '@/service/categories.service';

export default function MenuItemFormFields({ form, isDirect, isPending, selectedRow }) {
    const { data: categoryData, isLoading: categoryIsLoading } = useQuery({
        queryKey: [categoryQueryKeys.ALL],
        queryFn: getAllCategory,
    });

    const categoryOptions = (categoryData?.categories || []).map((c) => ({
        value: c?.unique_id,
        label: c?.name,
    }));

    const coverImage = form.watch('cover_image');
    const imageWarning = !coverImage;

    return (
        <div className="mx-auto grid grid-cols-12 gap-4 px-4 pt-2 mb-2">
            <ReusableFormField
                control={form.control}
                name="name"
                required
                label="Item Name"
                placeholder="Enter the name of the menu item"
                className="col-span-12"
                disabled={isPending}
            />
            <ReusableFormField
                type="textarea"
                control={form.control}
                name="description"
                textAreaClassName="h-28"
                required
                label="Description"
                placeholder="Describe the menu item in detail"
                className="col-span-12"
                disabled={isPending}
            />
            <ReusableFormField
                control={form.control}
                type="select"
                required
                name="category_id"
                label="Category"
                isLoading={categoryIsLoading}
                options={categoryOptions}
                placeholder="Select a category"
                className="md:col-span-6 col-span-12"
                disabled={isPending || isDirect}
            />
            <ReusableFormField
                control={form.control}
                name="price"
                required
                label="Price"
                placeholder="Enter the price (e.g., 9.99)"
                className="md:col-span-6 col-span-12"
                disabled={isPending}
            />
            <ReusableFormField
                control={form.control}
                type="select"
                required
                name="veg_status"
                label="Food Type"
                options={MENU_ITEM_FOOD_OPTIONS}
                placeholder="Select Food Type"
                className="md:col-span-6 col-span-12"
                disabled={isPending}
            />
            <ReusableFormField
                control={form.control}
                type="select"
                required
                name="availability"
                label="Availability"
                options={MENU_ITEM_STOCK_OPTIONS}
                placeholder="Select Availability"
                className="md:col-span-6 col-span-12"
                disabled={isPending}
            />
            {form.watch('name') && (
                <ReusableFormField
                    control={form.control}
                    type="select"
                    name="status"
                    label="Status"
                    options={MENU_ITEM_STATUS_OPTIONS}
                    placeholder="Select Status"
                    className="col-span-12 md:col-span-6"
                    disabled={isPending}
                />
            )}

            <div className="col-span-12">
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <ImageAvatar
                    s3ImageUrl={selectedRow?.cover_image_url || selectedRow?.cover_image || ''}
                    onImageUpload={(image) => {
                        form.setValue('cover_image', image);
                    }}
                    onDeleteImage={() => {
                        form.setValue('cover_image', null);
                    }}
                />
                {imageWarning && (
                    <p className="text-orange-500 text-sm mt-2">
                        Warning: Uploading a cover image is optional but recommended for better visibility.
                    </p>
                )}
            </div>
        </div>
    );
}
