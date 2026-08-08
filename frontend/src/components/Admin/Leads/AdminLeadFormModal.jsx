import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Building2, User, Phone, Mail, MapPin, Globe, FileText, Loader2 } from 'lucide-react';
import { createAdminLead, updateAdminLead } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

const STATUS_OPTIONS = [
    { value: 'call_needed', label: 'Call Needed' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'visit_scheduled', label: 'Visit Scheduled' },
    { value: 'visited', label: 'Visited' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
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
                    contact_person: initialData.contact_person || '',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    address: initialData.address || '',
                    google_maps_url: initialData.google_maps_url || '',
                    status: initialData.status || 'call_needed',
                    notes: initialData.notes || '',
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
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.restaurant_name.trim()) {
            newErrors.restaurant_name = 'Restaurant name is required';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        if (!formData.city.trim()) {
            newErrors.city = 'City location is required';
        }
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Invalid email address';
        }
        if (formData.google_maps_url.trim() && !/^https?:\/\//i.test(formData.google_maps_url.trim())) {
            newErrors.google_maps_url = 'URL must start with http:// or https://';
        }
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
        onError: (err) => {
            toastError(err?.message || err?.err?.message || 'Failed to create lead');
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateAdminLead,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res?.message || 'Restaurant lead updated');
            onClose();
        },
        onError: (err) => {
            toastError(err?.message || err?.err?.message || 'Failed to update lead');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (isEdit) {
            updateMutation.mutate({
                leadId: initialData.unique_id,
                ...formData,
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">
                                {isEdit ? 'Edit Restaurant Lead' : 'Add New Restaurant Lead'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {isEdit ? 'Update details or pipeline status' : 'Enter target restaurant contact profile details'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Restaurant Name & Contact Person */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Restaurant Name <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="restaurant_name"
                                    placeholder="e.g. Grand Spice Cafe"
                                    value={formData.restaurant_name}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                                        errors.restaurant_name
                                            ? 'border-rose-500/80 focus:border-rose-500'
                                            : 'border-slate-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.restaurant_name && (
                                <p className="text-xs text-rose-400 mt-1">{errors.restaurant_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Person</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="contact_person"
                                    placeholder="e.g. Ramesh Patel (Owner)"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Phone Number <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. +91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                                        errors.phone
                                            ? 'border-rose-500/80 focus:border-rose-500'
                                            : 'border-slate-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="contact@restaurant.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                                        errors.email
                                            ? 'border-rose-500/80 focus:border-rose-500'
                                            : 'border-slate-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                City <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="e.g. Ahmedabad"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                                        errors.city
                                            ? 'border-rose-500/80 focus:border-rose-500'
                                            : 'border-slate-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="e.g. Gujarat"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={isPending}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Address & Google Maps URL */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Address</label>
                            <textarea
                                name="address"
                                rows={2}
                                placeholder="e.g. Shop 12, CG Road, Navrangpura"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={isPending}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Google Maps URL</label>
                            <div className="relative">
                                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="url"
                                    name="google_maps_url"
                                    placeholder="https://maps.google.com/..."
                                    value={formData.google_maps_url}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                                        errors.google_maps_url
                                            ? 'border-rose-500/80 focus:border-rose-500'
                                            : 'border-slate-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.google_maps_url && (
                                <p className="text-xs text-rose-400 mt-1">{errors.google_maps_url}</p>
                            )}
                        </div>
                    </div>

                    {/* Pipeline Status Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pipeline Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={isPending}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors cursor-pointer"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial / Outreach Notes</label>
                        <div className="relative">
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Log call results, visit notes, client requests..."
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={isPending}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{isEdit ? 'Save Changes' : 'Create Lead'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLeadFormModal;
