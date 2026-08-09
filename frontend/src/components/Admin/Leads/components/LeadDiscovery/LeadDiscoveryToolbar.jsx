import React from 'react';
import {
    Search,
    LayoutGrid,
    Table as TableIcon,
    CheckSquare,
    Square,
    Filter,
    X,
    RotateCcw,
} from 'lucide-react';

export function LeadDiscoveryToolbar({
    discoveryData,
    allLeadsCount = 0,
    newCount = 0,
    duplicateCount = 0,
    filteredCount = 0,
    selectedCount = 0,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    hideDuplicates,
    setHideDuplicates,
    onToggleSelectAllNew,
    onSelectAllFiltered,
    onDeselectAll,
}) {
    if (!discoveryData) return null;

    return (
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-3 shadow-xl">
            {/* Top Row: Search Input & Selection Shortcuts */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-lg">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search leads by restaurant name, cuisine, phone, address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Selection Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end shrink-0">
                    <button
                        onClick={onToggleSelectAllNew}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl shrink-0 transition-colors"
                        title="Select only Verified New leads"
                    >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Select New</span>
                    </button>

                    <button
                        onClick={onSelectAllFiltered}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl shrink-0 transition-colors"
                        title="Select all current results"
                    >
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Select All ({filteredCount})</span>
                    </button>

                    {selectedCount > 0 && (
                        <button
                            onClick={onDeselectAll}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl shrink-0 transition-colors"
                            title="Clear all selections"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear</span>
                        </button>
                    )}

                    {/* View Switcher: Table vs Grid Cards */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Data Table View"
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Grid Card View"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Status Tabs & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'all'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        All ({allLeadsCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'new'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        Verified New ({newCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('duplicates')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'duplicates'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                : 'text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        Duplicates ({duplicateCount})
                    </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={hideDuplicates}
                            onChange={(e) => setHideDuplicates(e.target.checked)}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                        />
                        <span>Hide Duplicates</span>
                    </label>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Filter className="w-3 h-3 text-indigo-400" />
                        <span>{filteredCount} leads</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryToolbar;
