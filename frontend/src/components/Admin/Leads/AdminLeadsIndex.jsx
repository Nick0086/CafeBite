import React, { useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useAdminLeadsData } from './hooks/useAdminLeadsData';
import { LeadHeader } from './components/LeadHeader';
import { LeadStats } from './components/LeadStats';
import { LeadToolbar } from './components/LeadToolbar';
import { LeadTable } from './components/LeadTable';
import { LeadDiscovery } from './components/LeadDiscovery';
import { LeadFormModal } from './components/LeadFormModal';
import { AdminLeadDeleteDialog } from './AdminLeadDeleteDialog';
import { LeadCoachingModal } from './components/LeadCoachingModal';

export function AdminLeadsIndex() {
    const [mainTab, setMainTab] = useState('pipeline'); // 'pipeline' | 'discovery'
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);

    const [formModalState, setFormModalState] = useState({ open: false, mode: 'create', data: null });
    const [deleteDialogState, setDeleteDialogState] = useState({ open: false, lead: null });
    const [coachingModalState, setCoachingModalState] = useState({ open: false, lead: null });

    const { adminUser, leads, stats, isLoading, isRefetching, refetch, logoutMutation } = useAdminLeadsData({ searchQuery, activeTab });

    const handleOpenCreate = () => setFormModalState({ open: true, mode: 'create', data: null });
    const handleOpenEdit = (lead) => setFormModalState({ open: true, mode: 'edit', data: lead });
    const handleOpenDelete = (lead) => setDeleteDialogState({ open: true, lead });
    const handleOpenCoaching = (lead) => setCoachingModalState({ open: true, lead });

    return (
        <div className="h-dvh overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
            {/* Header & Tab Navigation */}
            <LeadHeader
                adminUser={adminUser}
                mainTab={mainTab}
                setMainTab={setMainTab}
                searchVisible={searchVisible}
                setSearchVisible={setSearchVisible}
                isRefetching={isRefetching}
                refetch={refetch}
                logoutMutation={logoutMutation}
            />

            {/* Mobile Search Bar (Pipeline View) */}
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

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto space-y-3">
                {mainTab === 'discovery' ? (
                    <LeadDiscovery onImportSuccess={() => setMainTab('pipeline')} />
                ) : (
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
                            <p className="text-slate-400 text-xs mt-0.5">Sales pipeline &amp; AI coaching</p>
                        </div>

                        {/* Stats Cards */}
                        <LeadStats stats={stats} />

                        {/* Filter Toolbar */}
                        <LeadToolbar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            leadCount={leads.length}
                        />

                        {/* Table / Mobile Cards */}
                        <LeadTable
                            leads={leads}
                            isLoading={isLoading}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                            onCoaching={handleOpenCoaching}
                            onCreateLead={handleOpenCreate}
                        />
                    </>
                )}
            </main>

            {/* Mobile FAB */}
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

            {/* Modals & Dialogs */}
            <LeadFormModal
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
            <LeadCoachingModal
                open={coachingModalState.open}
                lead={coachingModalState.lead}
                onClose={() => setCoachingModalState({ open: false, lead: null })}
            />
        </div>
    );
}

export default AdminLeadsIndex;
