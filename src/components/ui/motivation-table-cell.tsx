import * as React from "react";
import { useRtlUtils } from "../../hooks/useRtlUtils";
import { LockInfo, PresenceState } from "../../lib/collaboration";
import { cn } from "../../lib/utils";
import { LockIndicator } from "./lock-indicator";

interface MotivationTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content: string;
  onUpdate: (newContent: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  cellId: string;
  sheetId: string;
  lockInfo?: LockInfo;
  presence?: PresenceState;
}

export const MotivationTableCell = React.forwardRef<
  HTMLTableCellElement,
  MotivationTableCellProps
>(
  (
    {
      cellId,
      content,
      onUpdate,
      onFocusChange,
      sheetId,
      lockInfo,
      presence,
      ...props
    },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();

    const lockOwner = presence?.[lockInfo?.userId ?? ""] ?? null;

    return (
      <td
        ref={ref}
        id={cellId}
        className={cn(
          "border p-2 relative group",
          getContentClass(content),
          lockInfo && "border-red-400"
        )}
        dir={getTextDirection(content)}
        {...props}
      >
        <LockIndicator lockInfo={lockInfo} lockOwner={lockOwner} />
        <div
          contentEditable={!lockInfo}
          suppressContentEditableWarning
          onFocus={() => {
            onFocusChange(true);
          }}
          onBlur={(e) => {
            onFocusChange(false);
            onUpdate(e.target.textContent || "");
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
