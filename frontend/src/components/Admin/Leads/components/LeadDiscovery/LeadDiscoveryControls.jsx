import React from 'react';
import { MapPin, Sliders, Radar, RefreshCw, Layers } from 'lucide-react';
import { RADIUS_OPTIONS, POPULAR_LOCATIONS } from '../../constants/adminLeads.constants';

export function LeadDiscoveryControls({
    locationInput,
    setLocationInput,
    selectedRadius,
    setSelectedRadius,
    isScanning,
    onSearchScan,
    onLocationPresetClick,
}) {
    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xl">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
                {/* Location Input */}
                <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Enter area, street, or city (e.g. Navrangpura)..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearchScan()}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                    />
                </div>

                {/* Radius Selector */}
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1.5 rounded-xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                    <Sliders className="w-4 h-4 text-indigo-400 ml-1.5 mr-1 shrink-0" />
                    {RADIUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedRadius(opt.value)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                selectedRadius === opt.value
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Scan Action Button */}
                <button
                    onClick={onSearchScan}
                    disabled={isScanning}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                    {isScanning ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Scanning Radar...</span>
                        </>
                    ) : (
                        <>
                            <Radar className="w-4 h-4 animate-pulse" />
                            <span>Scan Radius</span>
                        </>
                    )}
                </button>
            </div>

            {/* Mobile Shortcuts */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">Quick Presets:</span>
                    {POPULAR_LOCATIONS.map((loc) => (
                        <button
                            key={loc.label}
                            onClick={() => onLocationPresetClick(loc)}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                            📍 {loc.label.split(',')[0]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tap map to set pin</span>
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryControls;
