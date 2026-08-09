import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    LogOut,
    ShieldCheck,
    Building2,
    Clock,
    Calendar,
    Search,
    PhoneCall,
    MapPin,
    ExternalLink,
    Filter,
    RefreshCw,
    Plus,
    Pencil,
    Trash2,
    BrainCircuit,
    Sparkles,
    X,
    TrendingUp,
    Radar,
} from 'lucide-react';
import { logoutAdmin, adminTokenStore } from '@/service/adminAuth.service';
import { fetchAdminLeads } from '@/service/adminLeads.service';
import { toastSuccess } from '@/utils/toast-utils';
import { AdminLeadFormModal } from './AdminLeadFormModal';
import { AdminLeadDeleteDialog } from './AdminLeadDeleteDialog';
import { AdminLeadCoachingPanelModal } from './AdminLeadCoachingPanelModal';
import { AdminLeadDiscoveryView } from './AdminLeadDiscoveryView';

const STATUS_CONFIG = {
    all:             { label: 'All',             color: 'bg-slate-700/60 text-slate-300 border-slate-600/60',       dot: 'bg-slate-400'   },
    call_needed:     { label: 'Call Needed',     color: 'bg-amber-500/15 text-amber-400 border-amber-500/25',       dot: 'bg-amber-400'   },
    follow_up:       { label: 'Follow Up',       color: 'bg-blue-500/15 text-blue-400 border-blue-500/25',          dot: 'bg-blue-400'    },
    visit_scheduled: { label: 'Visit Scheduled', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25',    dot: 'bg-purple-400'  },
    visited:         { label: 'Visited',         color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',    dot: 'bg-indigo-400'  },
    closed_won:      { label: 'Closed Won',      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    closed_lost:     { label: 'Closed Lost',     color: 'bg-rose-500/15 text-rose-400 border-rose-500/25',          dot: 'bg-rose-400'    },
};

const FILTER_TABS = [
    { key: 'all',              label: 'All'             },
    { key: 'call_needed',      label: 'Call Needed'     },
    { key: 'follow_up',        label: 'Follow Up'       },
    { key: 'visit_scheduled',  label: 'Visit Scheduled' },
    { key: 'visited',          label: 'Visited'         },
    { key: 'closed_won',       label: 'Won'             },
    { key: 'closed_lost',      label: 'Lost'            },
];

const STAT_CARDS = [
    { key: 'totalLeads',       label: 'Total Leads', icon: Building2,  colorClass: 'text-indigo-400',  bgClass: 'bg-indigo-500/10 border-indigo-500/20',   numClass: 'text-slate-100'   },
    { key: 'followUpsPending', label: 'Follow-ups',  icon: Clock,      colorClass: 'text-blue-400',    bgClass: 'bg-blue-500/10 border-blue-500/20',        numClass: 'text-blue-400'    },
    { key: 'visitsScheduled',  label: 'Visits',      icon: Calendar,   colorClass: 'text-purple-400',  bgClass: 'bg-purple-500/10 border-purple-500/20',    numClass: 'text-purple-400'  },
    { key: 'closedWon',        label: 'Closed Won',  icon: TrendingUp, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20',  numClass: 'text-emerald-400' },
];

// ─── Status Badge with dot indicator ──────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.call_needed;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
            {cfg.label}
        </span>
    );
}

// ─── Mobile Lead Card ──────────────────────────────────────────────────────────
function LeadCard({ lead, onEdit, onDelete, onCoaching }) {
    return (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 active:scale-[0.99] transition-transform">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="w-full min-w-0 font-bold text-sm text-slate-100 line-clamp-2 break-words">
                        {lead.restaurant_name}
                    </p>
                    {lead.contact_person && (
                        <p className="text-xs text-slate-400 mt-0.5">{lead.contact_person}</p>
                    )}
                </div>
                <StatusBadge status={lead.status} />
            </div>

            {/* Location & Phone */}
            <div className="flex flex-wrap items-center gap-1.5">
                {lead.city && (
                    <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/60 px-2 py-1 rounded-lg">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="font-medium">{lead.city}</span>
                    </div>
                )}
                {lead.phone && (
                    <a
                        href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                        title={lead.restaurant_name}
                        className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg font-semibold active:bg-emerald-500/20 transition-colors"
                    >
                        <PhoneCall className="w-3 h-3" />
                        <span>{lead.phone}</span>
                    </a>
                )}
                {lead.google_maps_url && (
                    <a
                        href={lead.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg font-medium active:bg-slate-700 transition-colors"
                    >
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                )}
            </div>

            {/* Notes */}
            {lead.notes && (
                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                    {lead.notes}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                <button
                    onClick={() => onCoaching(lead)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    AI Coaching
                </button>
                <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    title="Edit Lead"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    title="Delete Lead"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AdminLeadsIndex() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const adminUser = adminTokenStore.getAdminUser();

    const [mainTab, setMainTab] = useState('pipeline'); // 'pipeline' | 'discovery'
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);

    const [formModalState, setFormModalState] = useState({ open: false, mode: 'create', data: null });
    const [deleteDialogState, setDeleteDialogState] = useState({ open: false, lead: null });
    const [coachingModalState, setCoachingModalState] = useState({ open: false, lead: null });

    const { data: responseData, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['admin-leads', { search: searchQuery, status: activeTab }],
        queryFn: () => fetchAdminLeads({ search: searchQuery, status: activeTab }),
    });

    const leads = responseData?.data?.leads || [];
    const stats = responseData?.data?.stats || {
        totalLeads: 0,
        followUpsPending: 0,
        visitsScheduled: 0,
        closedWon: 0,
    };

    const logoutMutation = useMutation({
        mutationFn: logoutAdmin,
        onSuccess: () => {
            queryClient.clear();
            toastSuccess('Logged out successfully');
            navigate('/admin/login', { replace: true });
        },
        onError: () => {
            adminTokenStore.clear();
            queryClient.clear();
            navigate('/admin/login', { replace: true });
        },
    });

    const handleOpenCreate   = () => setFormModalState({ open: true, mode: 'create', data: null });
    const handleOpenEdit     = (lead) => setFormModalState({ open: true, mode: 'edit', data: lead });
    const handleOpenDelete   = (lead) => setDeleteDialogState({ open: true, lead });
    const handleOpenCoaching = (lead) => setCoachingModalState({ open: true, lead });

    return (
        <div className="h-dvh overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">

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

            {/* ── Sub-header Dedicated Tab Navigation (Outside Header - Fixes Mobile Horizontal Overflow) ── */}
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

            {/* ── Mobile Search Bar (Pipeline View) ── */}
            {mainTab === 'pipeline' && searchVisible && (
                <div className="md:hidden px-4 pt-2.5 pb-1">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search restaurant name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* ── Main Content Area ── */}
            <main className="flex-1 px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto space-y-3">
                {mainTab === 'discovery' ? (
                    /* ── TAB 2: Dedicated Full Screen Auto Discovery View ── */
                    <AdminLeadDiscoveryView onImportSuccess={() => setMainTab('pipeline')} />
                ) : (
                    /* ── TAB 1: CRM Pipeline View ── */
                    <>
                        {/* Desktop page title */}
                        <div className="hidden md:flex items-center justify-between border-b border-slate-800/80 pb-3">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-white">Target Restaurant Leads</h2>
                                <p className="text-slate-400 text-xs mt-0.5">Manage leads, outreach, visits, and sales pipeline.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleOpenCreate}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Lead
                                </button>
                                <button
                                    onClick={() => refetch()}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                {/* Mobile page heading */}
                <div className="md:hidden">
                    <h2 className="text-base font-bold text-white">Restaurant Leads</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Sales pipeline & AI coaching</p>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {STAT_CARDS.map(({ key, label, icon: Icon, colorClass, bgClass, numClass }) => (
                        <div key={key} className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2">
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                                <h3 className={`text-xl font-extrabold mt-0.5 leading-none ${numClass}`}>{stats[key] ?? 0}</h3>
                            </div>
                            <div className={`p-2 border rounded-lg ${bgClass}`}>
                                <Icon className={`w-4 h-4 ${colorClass}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter Bar ── */}
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
                            <span>Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
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
                            {leads.length} lead{leads.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </div>

                {/* ── Content: Loading / Empty / Cards / Table ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-14 space-y-3 text-slate-400">
                        <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
                        <p className="text-sm">Loading pipeline records...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 space-y-3 text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
                        <Building2 className="w-10 h-10 text-slate-700" />
                        <h3 className="text-sm font-semibold text-slate-200">No leads found</h3>
                        <p className="text-xs text-slate-400 max-w-xs text-center">
                            No restaurant leads match your current filter. Try changing the status tab or search term.
                        </p>
                        <button
                            onClick={handleOpenCreate}
                            className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Lead
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card Grid */}
                        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {leads.map((lead) => (
                                <LeadCard
                                    key={lead.unique_id || lead.id}
                                    lead={lead}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleOpenDelete}
                                    onCoaching={handleOpenCoaching}
                                />
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3">Restaurant &amp; Contact</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Maps</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Notes</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {leads.map((lead) => (
                                            <tr key={lead.unique_id || lead.id} className="hover:bg-slate-800/25 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => handleOpenCoaching(lead)}
                                                        className="font-semibold text-sm text-slate-100 hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5 group/btn cursor-pointer"
                                                    >
                                                        <span>{lead.restaurant_name}</span>
                                                        <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                    </button>
                                                    {lead.contact_person && (
                                                        <div className="text-xs text-slate-500 mt-0.5">{lead.contact_person}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-200 font-medium text-sm">
                                                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                                        <span>{lead.city}</span>
                                                    </div>
                                                    {lead.address && (
                                                        <div className="text-xs text-slate-500 truncate max-w-[140px] mt-0.5" title={lead.address}>
                                                            {lead.address}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {lead.phone ? (
                                                        <a
                                                            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all"
                                                        >
                                                            <PhoneCall className="w-3 h-3" />
                                                            <span>{lead.phone}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {lead.google_maps_url ? (
                                                        <a
                                                            href={lead.google_maps_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                                                        >
                                                            <MapPin className="w-3 h-3 text-indigo-400" />
                                                            <span>View</span>
                                                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={lead.status} />
                                                </td>
                                                <td className="px-4 py-3 max-w-[160px]">
                                                    <p className="text-xs text-slate-400 truncate" title={lead.notes || ''}>
                                                        {lead.notes || '—'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenCoaching(lead)}
                                                            className="px-2 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                                            title="AI Coaching"
                                                        >
                                                            <BrainCircuit className="w-3 h-3" />
                                                            AI
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(lead)}
                                                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(lead)}
                                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </>
        )}
    </main>

            {/* ── Mobile FAB (Pipeline View) ── */}
            {mainTab === 'pipeline' && (
                <div className="md:hidden fixed bottom-5 right-4 z-30">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Lead
                    </button>
                </div>
            )}

            {/* ── Modals & Dialogs ── */}
            <AdminLeadFormModal
                open={formModalState.open}
                mode={formModalState.mode}
                initialData={formModalState.data}
                onClose={() => setFormModalState({ open: false, mode: 'create', data: null })}
            />
            <AdminLeadDeleteDialog
                open={deleteDialogState.open}
                lead={deleteDialogState.lead}
                onClose={() => setDeleteDialogState({ open: false, lead: null })}
            />
            <AdminLeadCoachingPanelModal
                open={coachingModalState.open}
                lead={coachingModalState.lead}
                onClose={() => setCoachingModalState({ open: false, lead: null })}
            />
        </div>
    );
}

export default AdminLeadsIndex;
