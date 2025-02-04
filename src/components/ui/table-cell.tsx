import * as React from "react";

import { Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useRtlUtils } from "../../hooks/useRtlUtils";

interface EditableTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content: string;
  onUpdate?: (newContent: string) => void;
  showDelete?: boolean;
  onDelete?: () => void;
  isHeader?: boolean;
}

export const EditableTableCell = React.forwardRef<
  HTMLTableCellElement,
  EditableTableCellProps
>(
  (
    {
      className,
      content,
      onUpdate,
      showDelete,
      onDelete,
      isHeader = false,
      ...props
    },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();

    const Element = isHeader ? "th" : "td";

    return (
      <Element
        ref={ref}
        className={cn(
          "border border-gray-300 p-2",
          isHeader && "bg-gray-100",
          getContentClass(content),
          className
        )}
        dir={getTextDirection(content)}
        {...props}
      >
        <div className="flex items-center justify-between gap-2 [dir='rtl']:flex-row-reverse">
          <span
            contentEditable={!!onUpdate}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.(e.target.textContent || "")}
            className={cn(
              "flex-1",
              onUpdate && "focus:outline-none focus:bg-blue-50"
            )}
          >
            {content}
          </span>
          {showDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </Element>
    );
  }
);
EditableTableCell.displayName = "EditableTableCell";

interface MotivationTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content?: string;
  onUpdate?: (newContent: string) => void;
}

export const MotivationTableCell = React.forwardRef<
  HTMLTableCellElement,
  MotivationTableCellProps
>(({ className, content = "", onUpdate, ...props }, ref) => {
  const { getContentClass, getTextDirection } = useRtlUtils();

  return (
    <td
      ref={ref}
      className={cn(
        "border border-gray-300 p-2",
        getContentClass(content),
        className
      )}
      dir={getTextDirection(content)}
      {...props}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.(e.target.textContent || "")}
        className="min-h-8 focus:outline-none focus:bg-blue-50"
      >
        {content}
      </div>
    </td>
  );
});
MotivationTableCell.displayName = "MotivationTableCell";
