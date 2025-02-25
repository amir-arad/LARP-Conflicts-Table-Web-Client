import * as React from 'react';

import { LockInfo, PresenceState } from '../../lib/collaboration';

import { LockIndicator } from './lock-indicator';
import { cn } from '../../lib/utils';
import { useRtlUtils } from '../../hooks/useRtlUtils';

interface MotivationTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  content: string;
  onUpdate: (newContent: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  cellId: string;
  lockInfo?: LockInfo;
  presence?: PresenceState;
}

export const MotivationTableCell = React.forwardRef<
  HTMLTableCellElement,
  MotivationTableCellProps
>(
  (
    { cellId, content, onUpdate, onFocusChange, lockInfo, presence, ...props },
    ref
  ) => {
    const { getContentClass, getTextDirection } = useRtlUtils();

    const lockOwner = presence?.[lockInfo?.userId ?? ''] ?? null;

    return (
      <td
        ref={ref}
        id={cellId}
        className={cn(
          'group relative border p-2',
          getContentClass(content),
          lockInfo && 'border-red-400'
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
          onBlur={e => {
            onFocusChange(false);
            onUpdate(e.target.textContent || '');
          }}
          className="min-h-8 focus:bg-blue-50 focus:outline-none"
        >
          {content}
        </div>
      </td>
    );
  }
);
MotivationTableCell.displayName = 'MotivationTableCell';
