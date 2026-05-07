interface CheckboxSkeletonProps {
    items?: number;
}

export default function CheckboxSkeleton({
 items = 6,
}: CheckboxSkeletonProps) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2"
                >
                    <div className="h-5 w-5 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            ))}
        </div>
    );
}