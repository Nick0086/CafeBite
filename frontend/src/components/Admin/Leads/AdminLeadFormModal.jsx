import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Building2, User, Phone, Mail, MapPin, Globe, Loader2, ChevronDown } from 'lucide-react';
import { createAdminLead, updateAdminLead } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

const STATUS_OPTIONS = [
    { value: 'call_needed',      label: 'Call Needed',      emoji: '📞' },
    { value: 'follow_up',        label: 'Follow Up',        emoji: '🔄' },
    { value: 'visit_scheduled',  label: 'Visit Scheduled',  emoji: '📅' },
    { value: 'visited',          label: 'Visited',          emoji: '✅' },
    { value: 'closed_won',       label: 'Closed Won',       emoji: '🏆' },
    { value: 'closed_lost',      label: 'Closed Lost',      emoji: '❌' },
];

const INITIAL_FORM_STATE = {
    restaurant_name: '',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    address: '',
    google_maps_url: '',
    status: 'call_needed',
    notes: '',
};

// Reusable field wrapper
function FieldGroup({ label, required, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>
    );
}

// Input with optional leading icon
function FieldInput({ icon: Icon, error, ...props }) {
    return (
        <div className="relative">
            {Icon && <Icon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
            <input
                {...props}
                className={`
                    w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-3
                    bg-slate-950 border rounded-xl text-sm text-slate-100
                    placeholder-slate-500 focus:outline-none transition-colors
                    disabled:opacity-50
                    ${error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}
                `}
            />
        </div>
    );
}

export function AdminLeadFormModal({ open, mode = 'create', initialData = null, onClose }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});

    const isEdit = mode === 'edit';

    useEffect(() => {
        if (open) {
            if (isEdit && initialData) {
                setFormData({
                    restaurant_name: initialData.restaurant_name || '',
                    contact_person:  initialData.contact_person  || '',
                    phone:           initialData.phone           || '',
                    email:           initialData.email           || '',
                    city:            initialData.city            || '',
                    state:           initialData.state           || '',
                    address:         initialData.address         || '',
                    google_maps_url: initialData.google_maps_url || '',
                    status:          initialData.status          || 'call_needed',
                    notes:           initialData.notes           || '',
                });
            } else {
                setFormData(INITIAL_FORM_STATE);
            }
            setErrors({});
        }
    }, [open, isEdit, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.restaurant_name.trim()) newErrors.restaurant_name = 'Restaurant name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
            newErrors.email = 'Invalid email address';
        if (formData.google_maps_url.trim() && !/^https?:\/\//i.test(formData.google_maps_url.trim()))
            newErrors.google_maps_url = 'URL must start with http:// or https://';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createMutation = useMutation({
        mutationFn: createAdminLead,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res?.message || 'New restaurant lead added');
            onClose();
        },
        onError: (err) => toastError(err?.message || err?.err?.message || 'Failed to create lead'),
    });

    const updateMutation = useMutation({
        mutationFn: updateAdminLead,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res?.message || 'Restaurant lead updated');
            onClose();
        },
        onError: (err) => toastError(err?.message || err?.err?.message || 'Failed to update lead'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isEdit) {
            updateMutation.mutate({ leadId: initialData.unique_id, ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    if (!open) return null;

    return (
        // Overlay — full-screen on mobile, centered dialog on md+
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">

            {/* Sheet/Dialog */}
            <div className="
                relative w-full bg-slate-900 border-t sm:border border-slate-800
                rounded-t-3xl sm:rounded-2xl shadow-2xl
                flex flex-col
                max-h-[92dvh] sm:max-h-[88vh]
                sm:max-w-2xl sm:mx-4
                overflow-hidden
            ">
                {/* Drag handle (mobile sheet indicator) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-700" />
                </div>

                {/* ── Modal Header ── */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-100">
                                {isEdit ? 'Edit Lead' : 'Add New Lead'}
                            </h3>
                            <p className="text-xs text-slate-400 hidden sm:block">
                                {isEdit ? 'Update details or pipeline status' : 'Enter restaurant contact profile'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable Form Body ── */}
                <form
                    id="lead-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4"
                >
                    {/* Restaurant Name & Contact Person */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldGroup label="Restaurant Name" required error={errors.restaurant_name}>
                            <FieldInput
                                icon={Building2}
                                type="text"
                                name="restaurant_name"
                                placeholder="e.g. Grand Spice Cafe"
                                value={formData.restaurant_name}
                                onChange={handleChange}
                                disabled={isPending}
                                error={errors.restaurant_name}
                            />
                        </FieldGroup>
                        <FieldGroup label="Contact Person">
                            <FieldInput
                                icon={User}
                                type="text"
                                name="contact_person"
                                placeholder="e.g. Ramesh Patel (Owner)"
                                value={formData.contact_person}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                        </FieldGroup>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldGroup label="Phone Number" required error={errors.phone}>
                            <FieldInput
                                icon={Phone}
                                type="tel"
                                name="phone"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isPending}
                                error={errors.phone}
                            />
                        </FieldGroup>
                        <FieldGroup label="Email Address" error={errors.email}>
                            <FieldInput
                                icon={Mail}
                                type="email"
                                name="email"
                                placeholder="contact@restaurant.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isPending}
                                error={errors.email}
                            />
                        </FieldGroup>
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="City" required error={errors.city}>
                            <FieldInput
                                icon={MapPin}
                                type="text"
                                name="city"
                                placeholder="Ahmedabad"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={isPending}
                                error={errors.city}
                            />
                        </FieldGroup>
                        <FieldGroup label="State">
                            <FieldInput
                                type="text"
                                name="state"
                                placeholder="Gujarat"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                        </FieldGroup>
                    </div>

                    {/* Full Address */}
                    <FieldGroup label="Full Address">
                        <textarea
                            name="address"
                            rows={2}
                            placeholder="Shop 12, CG Road, Navrangpura"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={isPending}
                            className="w-full px-3 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
                        />
                    </FieldGroup>

                    {/* Google Maps URL */}
                    <FieldGroup label="Google Maps URL" error={errors.google_maps_url}>
                        <FieldInput
                            icon={Globe}
                            type="url"
                            name="google_maps_url"
                            placeholder="https://maps.google.com/..."
                            value={formData.google_maps_url}
                            onChange={handleChange}
                            disabled={isPending}
                            error={errors.google_maps_url}
                        />
                    </FieldGroup>

                    {/* Pipeline Status — custom styled select */}
                    <FieldGroup label="Pipeline Status">
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={isPending}
                                className="w-full appearance-none px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors cursor-pointer disabled:opacity-50 pr-10"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                                        {opt.emoji} {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </FieldGroup>

                    {/* Notes */}
                    <FieldGroup label="Outreach Notes">
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Log call results, visit notes, client requests, follow-up details..."
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={isPending}
                            className="w-full px-3 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
                        />
                    </FieldGroup>
                </form>

                {/* ── Sticky Footer Actions ── */}
                <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 sm:flex-none px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="lead-form"
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isEdit ? 'Save Changes' : 'Create Lead'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminLeadFormModal;
