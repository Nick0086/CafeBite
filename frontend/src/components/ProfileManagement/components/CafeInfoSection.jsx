import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { ReusableFormField } from '@/common/Form/ReusableFormField';

export default function CafeInfoSection({ form, isDisabled }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 size={20} className="text-green-600" />
                    Cafe Information
                </CardTitle>
                <CardDescription>
                    Your cafe details and branding
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ReusableFormField
                    control={form.control}
                    name='cafeName'
                    required={true}
                    label='Cafe Name'
                    placeholder="Cafe Delicious"
                    disabled={isDisabled}
                />
                <ReusableFormField
                    control={form.control}
                    type='textarea'
                    name='cafeDescription'
                    required={true}
                    label='Cafe Description'
                    placeholder="Tell customers about your cafe, specialties, and atmosphere..."
                    disabled={isDisabled}
                />
                {form?.formState?.errors?.cafeLogo && (
                    <span className="text-sm text-red-500">
                        {form?.formState?.errors?.cafeLogo?.message}
                    </span>
                )}
            </CardContent>
        </Card>
    );
}
