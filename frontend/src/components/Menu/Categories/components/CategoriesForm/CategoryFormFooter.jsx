import { Button } from '@/components/ui/button';

export default function CategoryFormFooter({ onCancel, isPending }) {
    return (
        <div className="flex items-center gap-4 py-2">
            <Button type="submit" variant="gradient" disabled={isPending} isLoading={isPending}>
                Submit
            </Button>
            <Button type="button" variant="outline" color="ghost" className="cursor-pointer" onClick={onCancel}>
                Cancel
            </Button>
        </div>
    );
}
