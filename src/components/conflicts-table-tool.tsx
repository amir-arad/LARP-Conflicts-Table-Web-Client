import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Filter, Link, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ActiveUsersList } from './ui/active-users-list';
import { EditableTableCell } from './ui/table-cell';
import ErrorBoundary from './error-boundary';
import { MotivationTableCell } from './ui/motivation-table-cell';
import { useAuth } from '../contexts/AuthContext';
import { useConflictsTable } from '../hooks/useConflictsTable';
import { useFlags } from '../hooks/useFlags';
import { usePresence } from '../hooks/usePresence';
import { useTranslations } from '../hooks/useTranslations';

/**
 * Props for the ConflictsTableTool component
 *
 * @interface ConflictsTableToolProps
 * @property {string} sheetId - The ID of the Google Sheet containing the conflicts data
 */
interface ConflictsTableToolProps {
  sheetId: string;
}

/**
 * ConflictsTableTool Component
 *
 * @component
 * @description A tool for managing LARP character conflicts and motivations in a collaborative environment.
 * This component displays a table of conflicts (rows) and roles (columns), allowing users to edit
 * motivations for each conflict-role pair. It supports real-time collaboration with presence indicators
 * and lock mechanisms to prevent concurrent edits.
 *
 * @param {ConflictsTableToolProps} props - Component props
 * @param {string} props.sheetId - The ID of the Google Sheet containing the conflicts data
 *
 * @example
 * ```tsx
 * <ConflictsTableTool sheetId="1234567890abcdef" />
 * ```
 *
 * @remarks
 * This component is the main entry point for the conflicts table functionality.
 * It integrates with Firebase for real-time collaboration and Google Sheets for data storage.
 * Features include:
 * - Real-time collaborative editing
 * - User presence indicators
 * - Cell locking to prevent concurrent edits
 * - Filtering by roles and conflicts
 * - Adding and removing roles and conflicts
 * - Editing motivations
 */
const ConflictsTableTool = ({ sheetId }: ConflictsTableToolProps) => {
  const { isReady } = useAuth();
  const { registerPresence, unregisterPresence, locks, presence } =
    usePresence(sheetId);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const { t } = useTranslations();

  const [roleFilters, toggleRoleFilter] = useFlags({
    namespace: `${sheetId}-roleFilters`,
  });

  const [conflictFilters, toggleConflictFilter] = useFlags({
    namespace: `${sheetId}-conflictFilters`,
  });

  const {
    conflicts,
    roles,
    error,
    isLoading,
    loadData,
    addConflict,
    addRole,
    removeConflict,
    removeRole,
    updateMotivation,
    updateConflictName,
    updateRoleName,
  } = useConflictsTable();

  /**
   * Load data from the Google Sheet when the component mounts or the sheetId changes
   */
  useEffect(() => {
    if (sheetId) {
      loadData();
    }
  }, [sheetId, loadData]);

  /**
   * Register and unregister presence when the component mounts/unmounts or the activeCell changes
   */
  useEffect(() => {
    if (isReady) {
      registerPresence({ activeCell });
      return unregisterPresence;
    }
  }, [isReady, activeCell, registerPresence, unregisterPresence]);

  /**
   * Handle adding a new conflict
   */
  const handleAddConflict = useCallback(
    () => addConflict(t('table.newConflict')),
    [addConflict, t]
  );

  /**
   * Handle adding a new role
   */
  const handleAddRole = useCallback(
    () => addRole(t('table.newRole')),
    [addRole, t]
  );

  if (isLoading) {
    return <div>{t('app.loading')}</div>;
  }

  /**
   * Filter roles based on the selected role filters
   */
  const filteredRoles = roles.filter(
    role => roleFilters.length === 0 || roleFilters.includes(role.cellRef)
  );

  /**
   * Filter conflicts based on the selected conflict filters
   */
  const filteredConflicts = conflicts.filter(
    conflict =>
      conflictFilters.length === 0 || conflictFilters.includes(conflict.cellRef)
  );

  return (
    <ErrorBoundary component="ConflictsTableTool">
      <div className="max-w-full overflow-x-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 [dir='rtl']:flex-row-reverse">
              <CardTitle>{t('app.title')}</CardTitle>
              <ActiveUsersList
                presence={presence}
                className="max-w-md flex-1"
              />
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 whitespace-nowrap text-white hover:bg-purple-600 [dir='rtl']:flex-row-reverse"
              >
                <Link size={16} /> {t('app.openInSheets')}
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="mb-4">
              <AlertDescription>{t('app.autoSave')}</AlertDescription>
            </Alert>

            <div className="mb-4 flex gap-4 [dir='rtl']:flex-row-reverse">
              <button
                onClick={handleAddConflict}
                className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 [dir='rtl']:flex-row-reverse"
              >
                <Plus size={16} /> {t('action.addConflict')}
              </button>
              <button
                onClick={handleAddRole}
                className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 [dir='rtl']:flex-row-reverse"
              >
                <Plus size={16} /> {t('action.addRole')}
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold [dir='rtl']:flex-row-reverse">
                    <Filter size={16} /> {t('filter.roles')}
                  </h3>
                  <div className="flex flex-wrap gap-2 [dir='rtl']:flex-row-reverse">
                    {roles.map(role => (
                      <button
                        key={role.cellRef}
                        onClick={() => toggleRoleFilter(role.cellRef)}
                        className={`rounded-full px-3 py-1 text-sm ${
                          roleFilters.includes(role.cellRef)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {role.value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold [dir='rtl']:flex-row-reverse">
                    <Filter size={16} /> {t('filter.conflicts')}
                  </h3>
                  <div className="flex flex-wrap gap-2 [dir='rtl']:flex-row-reverse">
                    {conflicts.map(conflict => (
                      <button
                        key={conflict.cellRef}
                        onClick={() => toggleConflictFilter(conflict.cellRef)}
                        className={`rounded-full px-3 py-1 text-sm ${
                          conflictFilters.includes(conflict.cellRef)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {conflict.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 [dir='rtl']:text-right">
                <thead>
                  <tr>
                    <EditableTableCell
                      isHeader
                      content={t('table.header')}
                      cellId="cell-0-0"
                    />
                    {filteredRoles.map((role, roleIndex) => {
                      const cellId = `cell-0-${roleIndex + 1}`;
                      return (
                        <EditableTableCell
                          key={role.cellRef}
                          isHeader
                          content={role.value}
                          onUpdate={newContent =>
                            updateRoleName(role.cellRef, newContent)
                          }
                          onDelete={() => removeRole(role.cellRef)}
                          onFocusChange={isFocused => {
                            setActiveCell(isFocused ? cellId : null);
                          }}
                          cellId={cellId}
                          lockInfo={locks[cellId]}
                          presence={presence}
                        />
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredConflicts.map((conflict, conflictIndex) => {
                    const headerCellId = `cell-${conflictIndex + 1}-0`;
                    return (
                      <tr key={conflict.cellRef}>
                        <EditableTableCell
                          content={conflict.value}
                          onUpdate={newContent =>
                            updateConflictName(conflict.cellRef, newContent)
                          }
                          scope="row"
                          isHeader
                          onDelete={() => removeConflict(conflict.cellRef)}
                          onFocusChange={isFocused => {
                            setActiveCell(isFocused ? headerCellId : null);
                          }}
                          cellId={headerCellId}
                          lockInfo={locks[headerCellId]}
                          presence={presence}
                        />
                        {filteredRoles.map((role, roleIndex) => {
                          const motivation = conflict.motivations[role.cellRef];
                          const cellId = `cell-${conflictIndex + 1}-${
                            roleIndex + 1
                          }`;
                          return (
                            <MotivationTableCell
                              key={cellId}
                              cellId={cellId}
                              content={motivation?.value || ''}
                              onUpdate={newContent =>
                                updateMotivation(
                                  conflict.cellRef,
                                  role.cellRef,
                                  newContent
                                )
                              }
                              onFocusChange={isFocused => {
                                setActiveCell(isFocused ? cellId : null);
                              }}
                              lockInfo={locks[cellId]}
                              presence={presence}
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ConflictsTableTool;
