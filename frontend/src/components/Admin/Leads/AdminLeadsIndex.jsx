import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    LogOut,
    ShieldCheck,
    Building2,
    Clock,
    Calendar,
    CheckCircle2,
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
} from 'lucide-react';
import { logoutAdmin, adminTokenStore } from '@/service/adminAuth.service';
import { fetchAdminLeads } from '@/service/adminLeads.service';
import { toastSuccess } from '@/utils/toast-utils';
import { AdminLeadFormModal } from './AdminLeadFormModal';
import { AdminLeadDeleteDialog } from './AdminLeadDeleteDialog';
import { AdminLeadCoachingPanelModal } from './AdminLeadCoachingPanelModal';

const STATUS_CONFIG = {
    all: { label: 'All Leads', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    call_needed: { label: 'Call Needed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    follow_up: { label: 'Follow Up', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    visit_scheduled: { label: 'Visit Scheduled', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    visited: { label: 'Visited', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    closed_won: { label: 'Closed Won', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    closed_lost: { label: 'Closed Lost', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'call_needed', label: 'Call Needed' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'visit_scheduled', label: 'Visit Scheduled' },
    { key: 'visited', label: 'Visited' },
    { key: 'closed_won', label: 'Closed Won' },
    { key: 'closed_lost', label: 'Closed Lost' },
];

export function AdminLeadsIndex() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const adminUser = adminTokenStore.getAdminUser();

    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Dialog States
    const [formModalState, setFormModalState] = useState({ open: false, mode: 'create', data: null });
    const [deleteDialogState, setDeleteDialogState] = useState({ open: false, lead: null });
    const [coachingModalState, setCoachingModalState] = useState({ open: false, lead: null });

    // Fetch leads query
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

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const handleOpenCreate = () => {
        setFormModalState({ open: true, mode: 'create', data: null });
    };

    const handleOpenEdit = (lead) => {
        setFormModalState({ open: true, mode: 'edit', data: lead });
    };

    const handleOpenDelete = (lead) => {
        setDeleteDialogState({ open: true, lead });
    };

    const handleOpenCoaching = (lead) => {
        setCoachingModalState({ open: true, lead });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-100 leading-tight">CafeBite Admin CRM</h1>
                        <p className="text-xs text-slate-400">TOTP Authenticated Control Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{adminUser?.username || 'Super Admin'}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Dashboard Body */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Target Restaurant Leads</h2>
                        <p className="text-slate-400 text-sm mt-1">Manage leads, phone outreach, location visits, and sales pipeline stages.</p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Lead</span>
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
                            <span>Refresh Data</span>
                        </button>
                    </div>
                </div>

                {/* Real-Time Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Total Leads</p>
                            <h3 className="text-2xl font-bold text-slate-100 mt-1">{stats.totalLeads}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Follow-ups Pending</p>
                            <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.followUpsPending}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Visits Scheduled</p>
                            <h3 className="text-2xl font-bold text-purple-400 mt-1">{stats.visitsScheduled}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Closed Won</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.closedWon}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter Controls & Search */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by restaurant name or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {/* Quick Info */}
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Filter className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {FILTER_TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 space-y-3">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                            <p className="text-sm">Loading lead pipeline records...</p>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 space-y-3">
                            <Building2 className="w-10 h-10 mx-auto text-slate-600" />
                            <h3 className="text-base font-semibold text-slate-200">No leads found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No restaurant leads match your current search query or active pipeline status filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-900 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Restaurant & Contact</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Phone Dial</th>
                                        <th className="px-6 py-4">Google Maps</th>
                                        <th className="px-6 py-4">Pipeline Status</th>
                                        <th className="px-6 py-4">Notes</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {leads.map((lead) => {
                                        const statusBadge = STATUS_CONFIG[lead.status] || STATUS_CONFIG.call_needed;
                                        return (
                                            <tr key={lead.unique_id || lead.id} className="hover:bg-slate-800/30 transition-colors">
                                                {/* Restaurant & Contact Person */}
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleOpenCoaching(lead)}
                                                        className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors text-left group cursor-pointer flex items-center gap-1.5"
                                                        title="Click to open AI Coaching Panel & Recordings"
                                                    >
                                                        <span>{lead.restaurant_name}</span>
                                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                    {lead.contact_person && (
                                                        <div className="text-xs text-slate-400 mt-0.5">{lead.contact_person}</div>
                                                    )}
                                                </td>

                                                {/* City & Address */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                                                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                                        <span>{lead.city}</span>
                                                    </div>
                                                    {lead.address && (
                                                        <div className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5" title={lead.address}>
                                                            {lead.address}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Phone Number (tel: link) */}
                                                <td className="px-6 py-4">
                                                    {lead.phone ? (
                                                        <a
                                                            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all group"
                                                            title={`Click to call ${lead.phone}`}
                                                        >
                                                            <PhoneCall className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                            <span>{lead.phone}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">N/A</span>
                                                    )}
                                                </td>

                                                {/* Google Maps Icon Button */}
                                                <td className="px-6 py-4">
                                                    {lead.google_maps_url ? (
                                                        <a
                                                            href={lead.google_maps_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                                                            title="Open direct Google Maps navigation"
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                            <span>View Map</span>
                                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">No map link</span>
                                                    )}
                                                </td>

                                                {/* Pipeline Status Badge */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-xs text-slate-400 truncate" title={lead.notes || ''}>
                                                        {lead.notes || '—'}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenCoaching(lead)}
                                                            className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                                            title="Open AI Audio Analysis & Coaching Panel"
                                                        >
                                                            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                                                            <span>AI Coaching</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(lead)}
                                                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                                            title="Edit Lead Profile"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(lead)}
                                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                                            title="Delete Lead"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals & Dialogs */}
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


