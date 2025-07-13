import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cafeBasicFormSchema, cafeContactFormSchema, cafeLocationFormSchema, personalFormSchema } from './schema'
import { queryKeyLoopUp } from '../Authentication/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import ReusableFormField from '@/common/Form/ReusableFormField'
import { Upload, User, Building2, MapPin, Phone, Facebook, Instagram, Twitter, Save, Edit, X, Check, Hash } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/utils/toast-utils'
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from '@/service/common.service'
import { PermissionsContext } from '@/contexts/PermissionsContext'
import { getClientData, updateClinetProfile } from '@/service/user.service'
import { Separator } from '../ui/separator'
import { verifySubscriptionPayment } from '@/service/subscription.service'
import { Link } from 'react-router'

const profileFormSchema = z.object({
    ...personalFormSchema.shape,
    ...cafeBasicFormSchema.shape,
    ...cafeLocationFormSchema.shape,
    ...cafeContactFormSchema.shape,
})

export default function ProfileManagement() {
    const [logoPreview, setLogoPreview] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const fileInputRef = React.useRef(null)
    const { permissions, updatePermissions } = React.useContext(PermissionsContext);

    const form = useForm({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            cafeName: '',
            cafeDescription: '',
            cafeLogo: null,
            cafeAddress: '',
            cafeCountry: '',
            cafeState: '',
            cafeCity: '',
            cafeZip: '',
            cafeCurrency: '',
            cafePhone: '',
            cafeEmail: '',
            cafeWebsite: '',
            socialInstagram: '',
            socialFacebook: '',
            socialTwitter: '',
        }
    })

    const country = form.watch('cafeCountry')
    const state = form.watch('cafeState')

    // Location data queries
    const { data: countryData, isLoading: countryDataIsLoading } = useQuery({
        queryKey: [queryKeyLoopUp['COUNTRY']],
        queryFn: getAllCountry,
    })

    const { data: statesData, isLoading: stateDataIsLoading } = useQuery({
        queryKey: [queryKeyLoopUp['STATE'], country],
        queryFn: () => getStateByCountry(country),
        enabled: !!country
    })

    const { data: cityData, isLoading: cityDataIsLoading } = useQuery({
        queryKey: [queryKeyLoopUp['CITY'], state],
        queryFn: () => getCityByState(state),
        enabled: !!state
    })

    const { data: currencyData, isLoading: currencyDataIsLoading } = useQuery({
        queryKey: [queryKeyLoopUp['CURRENCY']],
        queryFn: getAllCurrency,
    })

    const clientDataGetMutation = useMutation({
        mutationFn: getClientData,
        onSuccess: (res) => {
            updatePermissions(res?.data);
        },
        onError: (error) => {
            console.error("Error while getting user data", error);
        },
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: updateClinetProfile,
        onSuccess: () => {
            toastSuccess('Profile updated successfully')
            setIsEditing(false)
            clientDataGetMutation.mutate();
        },
        onError: (error) => {
            console.error('Error updating profile:', error)
            toastError(`Error updating profile: ${error?.message || 'Unknown error'}`)
        }
    })

    // payment check mutation
    const paymentCheckMutation = useMutation({
        mutationFn: verifySubscriptionPayment,
        onSuccess: () => {
            toastSuccess('Payment successful! Your subscription has been renewed.');
            // Refresh the page or update the subscription data
            window.location.reload();
        },
        onError: (error) => {
            console.error('Payment verification error:', error);
            toastError('Payment verification failed. Please contact support.');
        }
    })

    // Populate form with profile data
    useEffect(() => {
        if (permissions) {
            const data = permissions || {}
            form.reset({
                firstName: data?.first_name || '',
                lastName: data?.last_name || '',
                email: data?.email || '',
                phoneNumber: data?.mobile || '',
                cafeName: data?.cafe_name || '',
                cafeDescription: data?.cafe_description || '',
                cafeAddress: data?.address_line1 || '',
                cafeCountry: data?.country_id || '',
                cafeState: data?.state_id || '',
                cafeCity: data?.city_id || '',
                cafeZip: data?.postal_code || '',
                cafeCurrency: data?.currency_code || '',
                cafePhone: data?.cafe_phone || '',
                cafeEmail: data?.cafe_email || '',
                cafeWebsite: data?.cafe_website || '',
                socialInstagram: data?.social_instagram || '',
                socialFacebook: data?.social_facebook || '',
                socialTwitter: data?.social_twitter || '',
            })

            if (data?.logo_signed_url) {
                setLogoPreview(data?.logo_signed_url)
            }
        }
    }, [permissions, form])

    // Prepare options for dropdowns
    const countryOptions = React.useMemo(() => {
        if (!countryData) return []
        return countryData?.country?.map((country) => ({
            label: country.country,
            value: country.id,
        })) || []
    }, [countryData])

    const stateOptions = React.useMemo(() => {
        if (!statesData) return []
        return statesData?.state?.map((state) => ({
            label: state.state,
            value: state.id,
        })) || []
    }, [statesData])

    const cityOptions = React.useMemo(() => {
        if (!cityData) return []
        return cityData?.city?.map((city) => ({
            label: city.city,
            value: city.id,
        })) || []
    }, [cityData])

    const currencyOptions = React.useMemo(() => {
        if (!currencyData) return []
        return currencyData?.currency?.map((currency) => ({
            label: `${currency.name} (${currency.symbol})`,
            value: currency.code,
        })) || []
    }, [currencyData])

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue("cafeLogo", file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = (data) => {
        const formData = new FormData()
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value)
            }
        }
        updateProfileMutation.mutate(formData)
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (permissions) {
            const data = permissions || {}
            form.reset({
                firstName: data?.first_name || '',
                lastName: data?.last_name || '',
                email: data?.email || '',
                phoneNumber: data?.mobile || '',
                cafeName: data?.cafe_name || '',
                cafeDescription: data?.cafe_description || '',
                cafeAddress: data?.address_line1 || '',
                cafeCountry: data?.country_id || '',
                cafeState: data?.state_id || '',
                cafeCity: data?.city_id || '',
                cafeZip: data?.postal_code || '',
                cafeCurrency: data?.currency_code || '',
                cafePhone: data?.cafe_phone || '',
                cafeEmail: data?.cafe_email || '',
                cafeWebsite: data?.cafe_website || '',
                socialInstagram: data?.social_instagram || '',
                socialFacebook: data?.social_facebook || '',
                socialTwitter: data?.social_twitter || '',
            })
            if (data?.logo_signed_url) {
                setLogoPreview(data?.logo_signed_url)
            }
        }
    }

    return (
        <Card className="p-6 shadow-none">
            {/* Header Section */}


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div >
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
                                <p className="text-gray-600 mt-1">Manage your personal and cafe information</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="add" type='button' >
                                        <Edit size={16} /> Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancel} variant="outline" type='button' size='sm' disabled={updateProfileMutation.isPending}>
                                            <X size={16} className='mr-1' /> Cancel
                                        </Button>
                                        <Button variant='gradient' size='sm' type='submit' disabled={updateProfileMutation.isPending} isLoading={updateProfileMutation.isPending}>
                                            <Save size={16} className='mr-1' /> Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Summary Section */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
                        {permissions?.subscription?.is_expired === true && (
                            <div className="border-t border-blue-200 bg-gradient-to-r from-red-50 to-orange-50 p-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-red-700 font-medium text-sm">
                                            Your subscription has expired. Please renew to continue using our services.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <CardContent className="p-6 flex flex-col gap-y-4 lg:flex-row lg:justify-between">
                            <div className="flex flex-col md:flex-row items-center md:space-x-6 space-x-0">
                                <div className="flex-shrink-0">
                                    <div
                                        onClick={isEditing ? triggerFileInput : undefined}
                                        className={`w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex flex-col items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer hover:shadow-xl transition-shadow' : 'cursor-default'}`}
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Cafe logo preview" className="w-full h-full object-cover" />
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
                                        disabled={!isEditing || updateProfileMutation.isPending}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold md:text-left text-center text-gray-900">
                                        {form.watch('cafeName') || 'Your Cafe Name'}
                                    </h2>
                                    <p className="text-gray-600 mt-1 md:text-left text-center">
                                        Owned by {form.watch('firstName')} {form.watch('lastName')}
                                    </p>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                                        {form.watch('cafeCity') && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span>{cityOptions?.find(v => v?.value === form.watch('cafeCity'))?.label}</span>
                                            </div>
                                        )}
                                        {form.watch('cafePhone') && (
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} />
                                                <span>{form.watch('cafePhone')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                                        <a
                                            href="https://merchant.razorpay.com/policy/QkdcFCJmy1V0gQ/terms"
                                            className="text-sm text-blue-600"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Terms & Conditions
                                        </a>
                                        <a
                                            href="https://merchant.razorpay.com/policy/QkdcFCJmy1V0gQ/contact_us"
                                            className="text-sm text-blue-600"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Contact Us
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-white rounded-lg p-4 flex flex-col lg:flex-row lg:gap-4 gap-y-2'>
                                <div className='space-y-2'>
                                    <div className="flex gap-2 justify-between items-center">
                                        <span className="text-sm text-gray-600">Plan:</span>
                                        <span className="text-sm font-medium text-gray-900">{permissions?.subscription?.plan_name || "-"}</span>
                                    </div>
                                    <div className="flex gap-2 justify-between items-center">
                                        <span className="text-sm text-gray-600">Amount:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {permissions?.subscription?.amount ? `₹ ${permissions?.subscription?.amount}` : "-"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 justify-between items-center">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        {permissions?.subscription?.status ? <span className={`text-xs px-2 py-1 rounded-full font-medium ${permissions?.subscription?.status === 'trial'
                                            ? 'bg-orange-100 text-orange-800'
                                            : permissions?.subscription?.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {permissions?.subscription?.status.charAt(0).toUpperCase() + permissions?.subscription?.status?.slice(1)}
                                        </span> : "-"}
                                    </div>
                                </div>

                                <Separator orientation="vertical" className='h-20 lg:block hidden' />

                                <div className='space-y-2'>
                                    <div className="flex gap-2 justify-between items-center">
                                        <span className="text-sm text-gray-600">Expires On:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {permissions?.subscription?.end_date ? new Date(permissions?.subscription?.end_date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }) : "-"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 justify-between items-center">
                                        <span className="text-sm text-gray-600">Days Remaining:</span>
                                        {permissions?.subscription?.remaining_days ? <span className={`text-sm font-medium ${permissions?.subscription?.remaining_days <= 7
                                            ? 'text-red-600'
                                            : permissions?.subscription?.remaining_days <= 14
                                                ? 'text-orange-600'
                                                : 'text-green-600'
                                            }`}>
                                            {permissions?.subscription?.remaining_days} days
                                        </span> : "-"}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {"CLIENT_17470726018932181" === permissions?.data?.unique_id && (<button
                                            type='button'
                                            onClick={() => {
                                                // Load Razorpay script dynamically
                                                const script = document.createElement('script');
                                                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                                script.onload = () => {
                                                    const options = {
                                                        key: import.meta.env.VITE_BASE_RAZORPAY, // Replace with your key
                                                        amount: 1 * 100, // Amount in paise
                                                        currency: 'INR',
                                                        captured: true,
                                                        name: 'Cafe Bite Subscription',
                                                        description: 'Renew your subscription',
                                                        handler: async function (response) {
                                                            try {
                                                                // console.log('Payment response:', response);
                                                                paymentCheckMutation.mutate(response.razorpay_payment_id);

                                                                // Verify payment using Razorpay API
                                                                // const verificationResponse = await fetch('/api/verify-payment-with-razorpay', {
                                                                //     method: 'POST',
                                                                //     headers: {
                                                                //         'Content-Type': 'application/json',
                                                                //     },
                                                                //     body: JSON.stringify({
                                                                //         payment_id: response.razorpay_payment_id,
                                                                //         expected_amount: permissions?.subscription?.amount * 100,
                                                                //         user_id: permissions?.user?.id // Add user ID for subscription update
                                                                //     })
                                                                // });

                                                                // const result = await verificationResponse.json();

                                                                // if (result.success) {
                                                                //     alert('Payment successful! Your subscription has been renewed.');
                                                                //     // Refresh the page or update the subscription data
                                                                //     window.location.reload();
                                                                // } else {
                                                                //     alert(`Payment verification failed: ${result.message}`);
                                                                // }
                                                            } catch (error) {
                                                                console.error('Payment verification error:', error);
                                                                alert('Payment verification failed. Please contact support.');
                                                            }
                                                        },
                                                        modal: {
                                                            ondismiss: function () {
                                                                console.log('Payment modal closed');
                                                            }
                                                        },

                                                        prefill: {
                                                            name: `${form.watch('firstName')} ${form.watch('lastName')}`,
                                                            email: permissions?.email, // Add user email
                                                            contact: form.watch('cafePhone'),
                                                            captured: true,
                                                        },
                                                        theme: {
                                                            color: '#3B82F6'
                                                        }
                                                    };
                                                    const rzp = new window.Razorpay(options);
                                                    rzp.open();
                                                };
                                                document.head.appendChild(script);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Renew Subscription
                                        </button>)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information Section */}
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
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                                <ReusableFormField
                                    control={form.control}
                                    name='lastName'
                                    required={true}
                                    label='Last Name'
                                    placeholder="Last Name"
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                            </div>
                            <ReusableFormField
                                control={form.control}
                                name='email'
                                type='email'
                                required={true}
                                label='Email'
                                placeholder="your@email.com"
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />
                            <ReusableFormField
                                control={form.control}
                                name='phoneNumber'
                                type='PhoneInput'
                                required={true}
                                label='Mobile Number'
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />
                        </CardContent>
                    </Card>

                    {/* Cafe Information Section */}
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
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />
                            <ReusableFormField
                                control={form.control}
                                type='textarea'
                                name='cafeDescription'
                                required={true}
                                label='Cafe Description'
                                placeholder="Tell customers about your cafe, specialties, and atmosphere..."
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />
                            {form?.formState?.errors?.cafeLogo && (
                                <span className="text-sm text-red-500">
                                    {form?.formState?.errors?.cafeLogo?.message}
                                </span>
                            )}
                        </CardContent>
                    </Card>

                    {/* Location Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin size={20} className="text-purple-600" />
                                Location Information
                            </CardTitle>
                            <CardDescription>
                                Your cafe's physical location and address details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ReusableFormField
                                control={form.control}
                                name='cafeAddress'
                                type='textarea'
                                required={true}
                                label='Street Address'
                                placeholder="Street Address"
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />

                            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                <ReusableFormField
                                    control={form.control}
                                    type='combobox'
                                    name='cafeCountry'
                                    required={true}
                                    label='Country'
                                    isLoading={countryDataIsLoading}
                                    options={countryOptions}
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                    onValueChange={(value) => {
                                        form.setValue('cafeState', '')
                                        form.setValue('cafeCity', '')
                                    }}
                                />
                                <ReusableFormField
                                    control={form.control}
                                    type='combobox'
                                    name='cafeState'
                                    required={true}
                                    label='State'
                                    isLoading={stateDataIsLoading}
                                    options={stateOptions}
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                    onValueChange={(value) => {
                                        form.setValue('cafeCity', '')
                                    }}
                                />
                                <ReusableFormField
                                    control={form.control}
                                    type='combobox'
                                    name='cafeCity'
                                    required={true}
                                    label='City'
                                    isLoading={cityDataIsLoading}
                                    options={cityOptions}
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                            </div>

                            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">

                                <ReusableFormField
                                    control={form.control}
                                    name='cafeZip'
                                    required={true}
                                    label='ZIP/Postal Code'
                                    placeholder="ZIP/Postal Code"
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                                <ReusableFormField
                                    control={form.control}
                                    type='combobox'
                                    name='cafeCurrency'
                                    required={true}
                                    label='Currency'
                                    isLoading={currencyDataIsLoading}
                                    options={currencyOptions}
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information Section */}
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
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                                <ReusableFormField
                                    control={form.control}
                                    type='email'
                                    name='cafeEmail'
                                    label='Cafe Email'
                                    placeholder="cafe@example.com"
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                />
                            </div>
                            <ReusableFormField
                                control={form.control}
                                name='cafeWebsite'
                                label='Cafe Website'
                                placeholder="https://www.cafe.com"
                                disabled={!isEditing || updateProfileMutation.isPending}
                            />
                        </CardContent>
                    </Card>

                    {/* Social Media Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hash size={20} className="text-pink-600" />
                                Social Media
                            </CardTitle>
                            <CardDescription>
                                Connect with customers on social platformsZ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-1 gap-4">
                                <ReusableFormField
                                    control={form.control}
                                    name='socialInstagram'
                                    label={
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                                                <Instagram size={16} className="text-pink-500" />
                                            </div>
                                            <span>Instagram</span>
                                        </div>
                                    }
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                    placeholder="Instagram username"
                                />

                                <ReusableFormField
                                    control={form.control}
                                    name='socialFacebook'
                                    label={
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Facebook size={16} className="text-blue-600" />
                                            </div>
                                            <span>Facebook</span>
                                        </div>
                                    }
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                    placeholder="Facebook page name"
                                />

                                <ReusableFormField
                                    control={form.control}
                                    name='socialTwitter'
                                    label={
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                                                <Twitter size={16} className="text-sky-500" />
                                            </div>
                                            <span>Twitter</span>
                                        </div>
                                    }
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                    placeholder="Twitter handle"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Section */}
                    {/* <Card className="bg-gray-50">
                        <CardHeader>
                            <CardTitle>Profile Overview</CardTitle>
                            <CardDescription>Quick summary of your profile information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Owner</p>
                                            <p className="text-sm text-gray-600">
                                                {form.watch('firstName')} {form.watch('lastName')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Building2 size={18} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Cafe</p>
                                            <p className="text-sm text-gray-600">
                                                {form.watch('cafeName') || 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <MapPin size={18} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Location</p>
                                            <p className="text-sm text-gray-600">
                                                {form.watch('cafeCity') || 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Phone size={18} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Contact</p>
                                            <p className="text-sm text-gray-600">
                                                {form.watch('cafePhone') || 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}
                </form>
            </Form>
        </Card>
    )
}