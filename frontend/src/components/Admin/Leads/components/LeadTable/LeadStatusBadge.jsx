import React from 'react';
import { STATUS_CONFIG } from '../../constants/adminLeads.constants';

export function LeadStatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.call_needed;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
            {cfg.label}
        </span>
    );
}

export default LeadStatusBadge;
