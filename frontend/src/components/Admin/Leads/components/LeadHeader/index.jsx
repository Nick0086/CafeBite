import React from 'react';
import { ShieldCheck, Search, X, RefreshCw, LogOut, Building2, Radar } from 'lucide-react';

export function LeadHeader({
    adminUser,
    mainTab,
    setMainTab,
    searchVisible,
    setSearchVisible,
    isRefetching,
    refetch,
    logoutMutation,
}) {
    return (
        <>
            {/* ── Sticky Top Navigation Header ── */}
            <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm text-slate-100 leading-tight">CafeBite CRM</h1>
                        <p className="text-[10px] text-slate-500 hidden xs:block">Admin Control Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {mainTab === 'pipeline' && (
                        <button
                            onClick={() => setSearchVisible((v) => !v)}
                            className="md:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Search"
                        >
                            {searchVisible ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                    )}

                    <button
                        onClick={() => refetch()}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{adminUser?.username || 'Admin'}</span>
                    </div>

                    <button
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* ── Sub-header Dedicated Tab Navigation ── */}
            <div className="border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 py-2 sticky top-[49px] z-20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start">
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setMainTab('pipeline')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                mainTab === 'pipeline'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>CRM Pipeline</span>
                        </button>
                        <button
                            onClick={() => setMainTab('discovery')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                mainTab === 'discovery'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Radar className="w-4 h-4 animate-spin-slow text-purple-300" />
                            <span>Auto-Discover Leads</span>
                            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                                OSM Radar
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LeadHeader;
