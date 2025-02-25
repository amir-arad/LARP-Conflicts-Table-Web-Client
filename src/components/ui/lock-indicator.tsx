import * as React from 'react';

import { Lock } from 'lucide-react';
import type { LockInfo, Presence } from '../../lib/collaboration';

interface LockIndicatorProps {
  lockInfo: LockInfo | undefined;
  lockOwner: Presence | null;
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({
  lockInfo,
  lockOwner,
}) => {
  if (!lockInfo) return null;

  return (
    <>
      <div className="absolute -top-2 -right-2 rounded-full bg-white p-0.5 shadow-sm">
        <Lock size={14} className="text-red-400" />
      </div>
      {lockOwner && (
        <div className="invisible absolute -top-8 right-0 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:visible">
          Locked by {lockOwner.name}
        </div>
      )}
    </>
  );
};
