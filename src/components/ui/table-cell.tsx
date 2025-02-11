import * as React from "react";

import { Lock, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useRtlUtils } from "../../hooks/useRtlUtils";
import { usePresence } from "../../hooks/usePresence";
import type { LockInfo, Presence } from "../../lib/collaboration";

interface LockIndicatorProps {
  lockInfo: LockInfo | undefined;
  lockOwner: Presence | null;
}

const LockIndicator: React.FC<LockIndicatorProps> = ({
  lockInfo,
  lockOwner,
}) => {
  if (!lockInfo) return null;

  return (
    <>
      <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
        <Lock size={14} className="text-red-400" />
      </div>
      {lockOwner && (
        <div className="absolute invisible group-hover:visible -top-8 right-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          Locked by {lockOwner.name}
        </div>
      )}
    </>
  );
};

interface EditableTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content: string;
  onUpdate?: (newContent: string) => void;
  showDelete?: boolean;
  onDelete?: () => void;
  isHeader?: boolean;
  rowIndex: number;
  colIndex: number;
  sheetId: string;
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
      sheetId,
      colIndex,
      rowIndex,
      ...props
    },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();
    const { locks, presence, registerPresence } = usePresence(sheetId);

    const Element = isHeader ? "th" : "td";
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const lockInfo = locks[cellId];
    const lockOwner = lockInfo ? presence[lockInfo.userId] : null;

    return (
      <Element
        ref={ref}
        id={cellId}
        className={cn(
          "border p-2 relative group",
          isHeader && "bg-gray-100",
          getContentClass(content),
          locks[cellId] && "border-red-400",
          className
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
              if (onUpdate) {
                registerPresence({ activeCell: cellId });
              }
            }}
            onBlur={(e) => {
              if (onUpdate) {
                registerPresence({ activeCell: null });
                onUpdate(e.target.textContent || "");
              }
            }}
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
  rowIndex: number;
  colIndex: number;
  sheetId: string;
}

export const MotivationTableCell = React.forwardRef<
  HTMLTableCellElement,
  MotivationTableCellProps
>(
  (
    {
      className,
      content = "",
      onUpdate,
      sheetId,
      rowIndex,
      colIndex,
      ...props
    },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();
    const { locks, presence, registerPresence } = usePresence(sheetId);

    const cellId = `cell-${rowIndex}-${colIndex}`;
    const lockInfo = locks[cellId];
    const lockOwner = lockInfo ? presence[lockInfo.userId] : null;

    return (
      <td
        ref={ref}
        id={cellId}
        className={cn(
          "border p-2 relative group",
          getContentClass(content),
          lockInfo && "border-red-400",
          className
        )}
        dir={getTextDirection(content)}
        {...props}
      >
        <LockIndicator lockInfo={lockInfo} lockOwner={lockOwner} />
        <div
          contentEditable={!lockInfo}
          suppressContentEditableWarning
          onFocus={() => {
            if (onUpdate) {
              registerPresence({ activeCell: cellId });
            }
          }}
          onBlur={(e) => {
            if (onUpdate) {
              registerPresence({ activeCell: null });
              onUpdate(e.target.textContent || "");
            }
          }}
          className="min-h-8 focus:outline-none focus:bg-blue-50"
        >
          {content}
        </div>
      </td>
    );
  }
);
MotivationTableCell.displayName = "MotivationTableCell";
