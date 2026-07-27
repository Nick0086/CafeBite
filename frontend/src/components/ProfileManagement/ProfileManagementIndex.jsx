import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, MapPin, Phone, Save, Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { fullProfileSchema } from '@/common/validation/profile.schemas';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { getClientData } from '@/service/user.service';
import {
    permissionsToFormValues,
    profileFormDefaultValues,
} from './constants/profile.constants';
import { useUpdateProfileMutation } from './hooks/useProfileData';
import { useCities } from './hooks/useLocationQueries';
import PersonalInfoSection from './components/PersonalInfoSection';
import CafeInfoSection from './components/CafeInfoSection';
import LocationSection from './components/LocationSection';
import ContactSection from './components/ContactSection';
import SocialMediaSection from './components/SocialMediaSection';
import SubscriptionSection from './components/SubscriptionSection';

export default function ProfileManagementIndex() {
    const queryClient = useQueryClient();
    const { permissions, updatePermissions } = useContext(PermissionsContext);
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    const form = useForm({
        resolver: zodResolver(fullProfileSchema),
        defaultValues: profileFormDefaultValues,
    });

    const city = form.watch('cafeCity');
    const { data: cityData } = useCities(city);
    const cityOptions = cityData?.city?.map((c) => ({ label: c.city, value: c.id }));

    const updateMutation = useUpdateProfileMutation({
        onSuccess: () => {
            toastSuccess('Profile updated successfully');
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['client', 'data'] });
            queryClient.fetchQuery({ queryKey: ['client', 'data'], queryFn: getClientData })
                .then((res) => { if (res?.data) updatePermissions(res.data); })
                .catch(() => {});
        },
        onError: (error) => {
            toastError(`Error updating profile: ${error?.message || 'Unknown error'}`);
        },
    });

    useEffect(() => {
        if (permissions && !isEditing) {
            form.reset(permissionsToFormValues(permissions));
            if (permissions?.logo_signed_url) {
                setLogoPreview(permissions.logo_signed_url);
            }
        }
    }, [permissions, form, isEditing]);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        form.setValue('cafeLogo', file);
        const reader = new FileReader();
        const objectUrl = URL.createObjectURL(file);
        reader.onload = () => {
            URL.revokeObjectURL(objectUrl);
            setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = (data) => {
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value);
            }
        }
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (permissions) {
            form.reset(permissionsToFormValues(permissions));
            if (permissions?.logo_signed_url) {
                setLogoPreview(permissions.logo_signed_url);
            }
        }
    };

    const isDisabled = !isEditing || updateMutation.isPending;
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');
    const cafeName = form.watch('cafeName');
    const cafePhone = form.watch('cafePhone');
    const cityLabel = cityOptions?.find((v) => v.value === city)?.label;

    return (
        <Card className="p-6 shadow-none">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div>
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
                                <p className="text-gray-600 mt-1">Manage your personal and cafe information</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="add" type="button">
                                        <Edit size={16} /> Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            type="button"
                                            size="sm"
                                            disabled={updateMutation.isPending}
                                        >
                                            <X size={16} className="mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            variant="gradient"
                                            size="sm"
                                            type="submit"
                                            disabled={updateMutation.isPending}
                                            isLoading={updateMutation.isPending}
                                        >
                                            <Save size={16} className="mr-1" /> Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
                        {permissions?.subscription?.is_expired === true && (
                            <div className="border-t border-blue-200 bg-gradient-to-r from-red-50 to-orange-50 p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-red-700 font-medium text-sm">
                                        Your subscription has expired. Please renew to continue using our services.
                                    </span>
                                </div>
                            </div>
                        )}
                        <CardContent className="p-6 flex flex-col gap-y-4 lg:flex-row lg:justify-between">
                            <div className="flex flex-col md:flex-row items-center md:space-x-6 space-x-0">
                                <div className="flex-shrink-0">
                                    <div
                                        onClick={isEditing ? () => fileInputRef.current?.click() : undefined}
                                        className={`w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex flex-col items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer hover:shadow-xl transition-shadow' : 'cursor-default'}`}
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Cafe logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500">Logo</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoChange}
                                        disabled={isDisabled}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold md:text-left text-center text-gray-900">
                                        {cafeName || 'Your Cafe Name'}
                                    </h2>
                                    <p className="text-gray-600 mt-1 md:text-left text-center">
                                        Owned by {firstName} {lastName}
                                    </p>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                                        {cityLabel && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span>{cityLabel}</span>
                                            </div>
                                        )}
                                        {cafePhone && (
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} />
                                                <span>{cafePhone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-20 lg:block hidden" />

                            <SubscriptionSection permissions={permissions} />
                        </CardContent>
                    </Card>

                    <PersonalInfoSection form={form} isDisabled={isDisabled} />
                    <CafeInfoSection form={form} isDisabled={isDisabled} />
                    <LocationSection form={form} isDisabled={isDisabled} />
                    <ContactSection form={form} isDisabled={isDisabled} />
                    <SocialMediaSection form={form} isDisabled={isDisabled} />
                </form>
            </Form>
        </Card>
    );
}
