import { Chip } from '@/components/ui/chip';

const statusConfig = {
    trial: { label: 'Trial', color: 'bg-orange-100 text-orange-800' },
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const daysRemainingStyle = (days) => {
    if (days <= 7) return 'text-red-600';
    if (days <= 14) return 'text-orange-600';
    return 'text-green-600';
};

export default function SubscriptionSection({ permissions }) {
    const subscription = permissions?.subscription;
    const currencySymbol = permissions?.currency_symbol || '';
    const status = statusConfig[subscription?.status];

    return (
        <div className="bg-card rounded-lg p-4 flex flex-col lg:flex-row lg:gap-4 gap-y-2">
            <div className='space-y-2'>
                <Row label="Plan:" value={subscription?.plan_name || '-'} />
                <Row label="Amount:" value={subscription?.amount ? `${currencySymbol} ${subscription.amount}` : '-'} />
                <div className="flex gap-2 justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    {status ? (
                        <Chip
                            className={`text-xs ${status.color}`}
                            variant="light"
                            color="gray"
                            radius="md"
                            size="sm"
                            border="none"
                        >
                            {status.label}
                        </Chip>
                    ) : '-'}
                </div>
            </div>

            <div className='space-y-2'>
                <Row label="Expires On:" value={formatDate(subscription?.end_date)} />
                <div className="flex gap-2 justify-between items-center">
                    <span className="text-sm text-gray-600">Days Remaining:</span>
                    {subscription?.remaining_days ? (
                        <span className={`text-sm font-medium ${daysRemainingStyle(subscription.remaining_days)}`}>
                            {subscription.remaining_days} days
                        </span>
                    ) : '-'}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex gap-2 justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}
