import * as React from "react";

import { Trash2 } from "lucide-react";
import { useRtlUtils } from "../../hooks/useRtlUtils";
import { PresenceState, LockInfo } from "../../lib/collaboration";
import { cn } from "../../lib/utils";
import { LockIndicator } from "./lock-indicator";

interface EditableTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content: string;
  onUpdate?: (newContent: string) => void;
  onDelete?: () => void;
  onFocusChange?: (isFocused: boolean) => void;
  isHeader?: boolean;
  cellId: string;
  sheetId: string;
  lockInfo?: LockInfo;
  presence?: PresenceState;
}

export const EditableTableCell = React.forwardRef<
  HTMLTableCellElement,
  EditableTableCellProps
>(
  (
    {
      content,
      onUpdate,
      onDelete,
      onFocusChange,
      isHeader = false,
      sheetId,
      cellId,
      lockInfo,
      presence,
      ...props
    },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();

    const Element = isHeader ? "th" : "td";
    const lockOwner = presence?.[lockInfo?.userId ?? ''] ?? null;

    return (
      <Element
        ref={ref}
        id={cellId}
        className={cn(
          "border p-2 relative group",
          isHeader && "bg-gray-100",
          getContentClass(content),
          lockInfo && "border-red-400"
        )}
        dir={getTextDirection(content)}
        {...props}
      >
        <LockIndicator lockInfo={lockInfo} lockOwner={lockOwner} />
        <div className="flex items-center justify-between gap-2 [dir='rtl']:flex-row-reverse">
          <span
            contentEditable={!!onUpdate && !lockInfo}
            suppressContentEditableWarning
            onFocus={() => {
              onFocusChange?.(true);
            }}
            onBlur={(e) => {
              onFocusChange?.(false);
              onUpdate?.(e.target.textContent || "");
            }}
            className={cn(
              "flex-1",
              onUpdate && "focus:outline-none focus:bg-blue-50"
            )}
          >
            {content}
          </span>
          {onDelete && (
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
