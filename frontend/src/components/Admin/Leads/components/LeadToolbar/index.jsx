import React from 'react';
import { Search, Filter } from 'lucide-react';
import { FILTER_TABS, STATUS_CONFIG } from '../../constants/adminLeads.constants';

export function LeadToolbar({
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    leadCount,
}) {
    return (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
            {/* Desktop search row */}
            <div className="hidden md:flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by restaurant name or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Showing {leadCount} lead{leadCount !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const cfg = STATUS_CONFIG[tab.key];
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                                isActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                            }`}
                        >
                            {tab.key !== 'all' && (
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white/80' : cfg?.dot}`} />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Mobile lead count */}
            <div className="md:hidden flex items-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    {leadCount} lead{leadCount !== 1 ? 's' : ''} found
                </span>
            </div>
        </div>
    );
}

export default LeadToolbar;
