export function FieldWrapper({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
