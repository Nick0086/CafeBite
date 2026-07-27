import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { CATEGORY_STATUS_OPTIONS } from '../../constants/category.constants';

export default function CategoryFormFields({ form, isEdit, isPending }) {
    return (
        <div className="space-y-4 mx-auto">
            <ReusableFormField
                control={form.control}
                name="name"
                required
                label="Category Name"
                placeholder="Add Category"
                disabled={isPending}
            />
            {isEdit && (
                <ReusableFormField
                    control={form.control}
                    type="select"
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={CATEGORY_STATUS_OPTIONS}
                    disabled={isPending}
                />
            )}
        </div>
    );
}
