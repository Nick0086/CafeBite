import { Button } from '@/components/ui/button';

export default function CategoryFormFooter({ onCancel, isPending }) {
    return (
        <div className="flex gap-2 border-t border-slate-100 pt-5 flex-row justify-end">
            <Button type="button" variant="outline" className="h-10" onClick={onCancel} disabled={isPending}>
                Cancel
            </Button>
            <Button type="submit" variant="gradient" className="h-10" disabled={isPending} isLoading={isPending}>
                {isPending ? 'Saving...' : 'Save category'}
            </Button>
        </div>
    );
}
