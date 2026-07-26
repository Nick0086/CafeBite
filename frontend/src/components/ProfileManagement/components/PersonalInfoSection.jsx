import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { ReusableFormField } from '@/common/Form/ReusableFormField';

export default function PersonalInfoSection({ form, isDisabled }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Personal Information
                </CardTitle>
                <CardDescription>
                    Your personal details and account information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <ReusableFormField
                        control={form.control}
                        name='firstName'
                        required={true}
                        label='First Name'
                        placeholder="First Name"
                        disabled={isDisabled}
                    />
                    <ReusableFormField
                        control={form.control}
                        name='lastName'
                        required={true}
                        label='Last Name'
                        placeholder="Last Name"
                        disabled={isDisabled}
                    />
                </div>
                <ReusableFormField
                    control={form.control}
                    name='email'
                    type='email'
                    required={true}
                    label='Email'
                    placeholder="your@email.com"
                    disabled={isDisabled}
                />
                <ReusableFormField
                    control={form.control}
                    name='phoneNumber'
                    type='PhoneInput'
                    required={true}
                    label='Mobile Number'
                    disabled={isDisabled}
                />
            </CardContent>
        </Card>
    );
}
