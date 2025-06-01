import { Skeleton } from '@/components/ui/skeleton';

export function Loading() {
    return (
        <li className="flex gap-4 p-3 border-b">
            <div className="flex items-center px-6">
                <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="flex flex-col gap-4 w-5/6">
                <Skeleton className="h-5 w-1/4 max-w-[200px]" />
                <Skeleton className="h-5 w-3/4 max-w-[200px]" />
            </div>
        </li>
    );
}
