import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';

export default function FullPageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-background lg:py-6">
            <PilsatingDotesLoader />
        </div>
    );
}
