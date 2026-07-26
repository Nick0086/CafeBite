import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import { ReusableFormField } from '@/common/Form/ReusableFormField';

export default function ContactSection({ form, isDisabled }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Phone size={20} className="text-orange-600" />
                    Contact Information
                </CardTitle>
                <CardDescription>
                    How customers can reach your cafe
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <ReusableFormField
                        control={form.control}
                        name='cafePhone'
                        type='PhoneInput'
                        required={true}
                        label='Cafe Phone'
                        disabled={isDisabled}
                    />
                    <ReusableFormField
                        control={form.control}
                        type='email'
                        name='cafeEmail'
                        label='Cafe Email'
                        placeholder="cafe@example.com"
                        disabled={isDisabled}
                    />
                </div>
                <ReusableFormField
                    control={form.control}
                    name='cafeWebsite'
                    label='Cafe Website'
                    placeholder="https://www.cafe.com"
                    disabled={isDisabled}
                />
            </CardContent>
        </Card>
    );
}
