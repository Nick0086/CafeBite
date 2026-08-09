import React from 'react';
import { Building2, User, Phone, Mail, MapPin, Globe, ChevronDown } from 'lucide-react';
import { FieldGroup, FieldInput } from './FieldInput';
import { STATUS_OPTIONS } from '../../constants/adminLeads.constants';

export function LeadFormFields({
    formData,
    errors,
    handleChange,
    isPending,
}) {
    return (
        <div className="space-y-3">
            {/* Restaurant Name & Contact Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldGroup label="Phone Number" error={errors.phone}>
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
            <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
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

            {/* Pipeline Status */}
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
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
                />
            </FieldGroup>
        </div>
    );
}

export default LeadFormFields;
