import { Button } from '@/components/ui/button';

export default function CategoryFormFooter({ onCancel, isPending }) {
    return (
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-10" onClick={onCancel} disabled={isPending}>
                Cancel
            </Button>
            <Button type="submit" variant="gradient" className="h-10" disabled={isPending} isLoading={isPending}>
                {isPending ? 'Saving...' : 'Save category'}
            </Button>
        </div>
    );
}
