import { Building2, Clock, Calendar, TrendingUp } from 'lucide-react';

export const STATUS_CONFIG = {
    all:             { label: 'All',             color: 'bg-slate-700/60 text-slate-300 border-slate-600/60',       dot: 'bg-slate-400'   },
    call_needed:     { label: 'Call Needed',     color: 'bg-amber-500/15 text-amber-400 border-amber-500/25',       dot: 'bg-amber-400'   },
    follow_up:       { label: 'Follow Up',       color: 'bg-blue-500/15 text-blue-400 border-blue-500/25',          dot: 'bg-blue-400'    },
    visit_scheduled: { label: 'Visit Scheduled', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25',    dot: 'bg-purple-400'  },
    visited:         { label: 'Visited',         color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',    dot: 'bg-indigo-400'  },
    closed_won:      { label: 'Closed Won',      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    closed_lost:     { label: 'Closed Lost',     color: 'bg-rose-500/15 text-rose-400 border-rose-500/25',          dot: 'bg-rose-400'    },
};

export const FILTER_TABS = [
    { key: 'all',              label: 'All'             },
    { key: 'call_needed',      label: 'Call Needed'     },
    { key: 'follow_up',        label: 'Follow Up'       },
    { key: 'visit_scheduled',  label: 'Visit Scheduled' },
    { key: 'visited',          label: 'Visited'         },
    { key: 'closed_won',       label: 'Won'             },
    { key: 'closed_lost',      label: 'Lost'            },
];

export const STAT_CARDS = [
    { key: 'totalLeads',       label: 'Total Leads', icon: Building2,  colorClass: 'text-indigo-400',  bgClass: 'bg-indigo-500/10 border-indigo-500/20',   numClass: 'text-slate-100'   },
    { key: 'followUpsPending', label: 'Follow-ups',  icon: Clock,      colorClass: 'text-blue-400',    bgClass: 'bg-blue-500/10 border-blue-500/20',        numClass: 'text-blue-400'    },
    { key: 'visitsScheduled',  label: 'Visits',      icon: Calendar,   colorClass: 'text-purple-400',  bgClass: 'bg-purple-500/10 border-purple-500/20',    numClass: 'text-purple-400'  },
    { key: 'closedWon',        label: 'Closed Won',  icon: TrendingUp, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20',  numClass: 'text-emerald-400' },
];

export const STATUS_OPTIONS = [
    { value: 'call_needed',      label: 'Call Needed',      emoji: '📞' },
    { value: 'follow_up',        label: 'Follow Up',        emoji: '🔄' },
    { value: 'visit_scheduled',  label: 'Visit Scheduled',  emoji: '📅' },
    { value: 'visited',          label: 'Visited',          emoji: '✅' },
    { value: 'closed_won',       label: 'Closed Won',       emoji: '🏆' },
    { value: 'closed_lost',      label: 'Closed Lost',      emoji: '❌' },
];

export const RADIUS_OPTIONS = [
    { label: '100m', value: 100 },
    { label: '250m', value: 250 },
    { label: '500m', value: 500 },
    { label: '1km',  value: 1000 },
    { label: '2km',  value: 2000 },
    { label: '5km',  value: 5000 },
];

export const POPULAR_LOCATIONS = [
    { label: 'Navrangpura, Ahmedabad', lat: 23.0333, lng: 72.5647 },
    { label: 'SG Highway, Ahmedabad',  lat: 23.0500, lng: 72.5000 },
    { label: 'Alkapuri, Vadodara',     lat: 22.3072, lng: 73.1812 },
    { label: 'FC Road, Pune',          lat: 18.5204, lng: 73.8567 },
    { label: 'Marine Drive, Mumbai',   lat: 18.9438, lng: 72.8232 },
];
