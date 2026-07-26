import { Button } from '@/components/ui/button';

export default function MenuItemFormFooter({ onCancel, isPending }) {
    return (
        <div className="flex items-center justify-start gap-2 sticky bottom-0 border-t bg-white py-2 px-4">
            <Button type="submit" variant="gradient" disabled={isPending} isLoading={isPending}>
                Submit
            </Button>
            <Button type="button" variant="outline" color="ghost" disabled={isPending} onClick={onCancel}>
                Cancel
            </Button>
        </div>
    );
}
