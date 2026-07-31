import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { CATEGORY_STATUS_OPTIONS } from '../../constants/category.constants';

export default function CategoryFormFields({ form, isEdit, isPending }) {
    return (
        <div className="space-y-5">
            <ReusableFormField
                control={form.control}
                name="name"
                required
                label="Category Name"
                placeholder="e.g. Breakfast, Main dishes, Desserts"
                disabled={isPending}
            />
            {isEdit && (
                <ReusableFormField
                    control={form.control}
                    type="select"
                    name="status"
                    label="Status"
                    placeholder="Choose a status"
                    options={CATEGORY_STATUS_OPTIONS}
                    disabled={isPending}
                />
            )}
        </div>
    );
}
