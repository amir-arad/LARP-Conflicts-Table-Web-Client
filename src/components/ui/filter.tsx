import * as React from "react";

import { X } from "lucide-react"; // Assuming you're using lucide-react for icons
import { cn } from "@/lib/utils";

interface FilterChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  label: string;
}

export const FilterChip = React.forwardRef<HTMLDivElement, FilterChipProps>(
  ({ className, onRemove, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm",
          "hover:bg-muted/80",
          "[dir='ltr']:pl-3 [dir='rtl']:pr-3",
          className
        )}
        {...props}
      >
        <span className="[dir='rtl']:text-right">{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
FilterChip.displayName = "FilterChip";

interface FilterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const FilterSection = React.forwardRef<
  HTMLDivElement,
  FilterSectionProps
>(({ className, title, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      {title && (
        <h3 className="text-sm font-medium [dir='rtl']:text-right">{title}</h3>
      )}
      <div className="flex flex-wrap gap-2 [dir='rtl']:space-x-reverse">
        {children}
      </div>
    </div>
  );
});
FilterSection.displayName = "FilterSection";

interface FilterContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FilterContainer = React.forwardRef<
  HTMLDivElement,
  FilterContainerProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4",
        "[dir='rtl']:text-right",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
FilterContainer.displayName = "FilterContainer";
