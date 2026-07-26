import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/ui/Layouts/user-nav';
import { cn } from '@/lib/utils';

export default function SidebarTopBar() {
    return (
        <header className={cn(
            'sticky flex h-12 shrink-0 top-0 z-10 w-full bg-background/95 border-b backdrop-blur',
            'supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary px-4'
        )}>
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex gap-2 flex-1 items-center justify-end">
                <Separator orientation="vertical" className="h-6" />
                <UserNav />
            </div>
        </header>
    );
}
