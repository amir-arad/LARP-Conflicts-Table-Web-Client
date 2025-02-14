import * as React from "react";

import { Lock } from "lucide-react";
import type { LockInfo, Presence } from "../../lib/collaboration";

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
