import React from 'react';

export function FieldGroup({ label, required, error, children }) {
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

export function FieldInput({ icon: Icon, error, ...props }) {
    return (
        <div className="relative">
            {Icon && <Icon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
            <input
                {...props}
                className={`
                    w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5
                    bg-slate-950 border rounded-xl text-sm text-slate-100
                    placeholder-slate-500 focus:outline-none transition-colors
                    disabled:opacity-50
                    ${error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}
                `}
            />
        </div>
    );
}

export default FieldInput;
