import { Button } from '@/components/ui/button';

export default function MenuItemFormFooter({ onCancel, isPending }) {
    return (
        <div className="sticky bottom-0 bg-white pb-2 pt-2 px-4 flex gap-2 border-t border-slate-100 flex-row justify-end">
            <Button type="button" variant="outline" size="sm" className="" onClick={onCancel} disabled={isPending}>
                Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" className="" disabled={isPending} isLoading={isPending}>
                {isPending ? 'Saving...' : 'Save menu item'}
            </Button>
        </div>
    );
}
