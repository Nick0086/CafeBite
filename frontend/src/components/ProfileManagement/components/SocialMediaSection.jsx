import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Instagram, Facebook, Twitter } from 'lucide-react';
import { ReusableFormField } from '@/common/Form/ReusableFormField';

const socialLabel = (Icon, color, label) => (
    <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center`}>
            <Icon size={16} className={`text-${color}-500`} />
        </div>
        <span>{label}</span>
    </div>
);

export default function SocialMediaSection({ form, isDisabled }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hash size={20} className="text-pink-600" />
                    Social Media
                </CardTitle>
                <CardDescription>
                    Connect with customers on social platforms
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-1 gap-4">
                    <ReusableFormField
                        control={form.control}
                        name='socialInstagram'
                        label={socialLabel(Instagram, 'pink', 'Instagram')}
                        disabled={isDisabled}
                        placeholder="Instagram username"
                    />

                    <ReusableFormField
                        control={form.control}
                        name='socialFacebook'
                        label={socialLabel(Facebook, 'blue', 'Facebook')}
                        disabled={isDisabled}
                        placeholder="Facebook page name"
                    />

                    <ReusableFormField
                        control={form.control}
                        name='socialTwitter'
                        label={socialLabel(Twitter, 'sky', 'Twitter')}
                        disabled={isDisabled}
                        placeholder="Twitter handle"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
