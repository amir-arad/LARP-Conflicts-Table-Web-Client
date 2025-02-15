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

interface ConflictsTableToolProps {
  sheetId: string;
}

const ConflictsTableTool = ({ sheetId }: ConflictsTableToolProps) => {
  const { access_token, isReady } = useAuth();
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
  } = useConflictsTable({
    sheetId: sheetId,
    token: access_token || '',
    gapi: window?.gapi,
  });

  useEffect(() => {
    if (access_token && sheetId) {
      loadData();
    }
  }, [access_token, sheetId, loadData]);

  useEffect(() => {
    if (isReady) {
      registerPresence({ activeCell });
      return unregisterPresence;
    }
  }, [isReady, activeCell, registerPresence, unregisterPresence]);

  const handleAddConflict = useCallback(
    () => addConflict(t('table.newConflict')),
    [addConflict, t]
  );

  const handleAddRole = useCallback(
    () => addRole(t('table.newRole')),
    [addRole, t]
  );

  if (!access_token || isLoading) {
    return <div>{t('app.loading')}</div>;
  }

  const filteredRoles = roles.filter(
    role => roleFilters.length === 0 || roleFilters.includes(role.cellRef)
  );

  const filteredConflicts = conflicts.filter(
    conflict =>
      conflictFilters.length === 0 || conflictFilters.includes(conflict.cellRef)
  );

  return (
    <ErrorBoundary component="ConflictsTableTool">
      <div className="p-4 max-w-full overflow-x-auto">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center gap-4 [dir='rtl']:flex-row-reverse">
              <CardTitle>{t('app.title')}</CardTitle>
              <ActiveUsersList
                presence={presence}
                className="flex-1 max-w-md"
              />
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 [dir='rtl']:flex-row-reverse whitespace-nowrap"
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

            <div className="flex gap-4 mb-4 [dir='rtl']:flex-row-reverse">
              <button
                onClick={handleAddConflict}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 [dir='rtl']:flex-row-reverse"
              >
                <Plus size={16} /> {t('action.addConflict')}
              </button>
              <button
                onClick={handleAddRole}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 [dir='rtl']:flex-row-reverse"
              >
                <Plus size={16} /> {t('action.addRole')}
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 [dir='rtl']:flex-row-reverse">
                    <Filter size={16} /> {t('filter.roles')}
                  </h3>
                  <div className="flex flex-wrap gap-2 [dir='rtl']:flex-row-reverse">
                    {roles.map(role => (
                      <button
                        key={role.cellRef}
                        onClick={() => toggleRoleFilter(role.cellRef)}
                        className={`px-3 py-1 rounded-full text-sm ${
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
                  <h3 className="font-semibold mb-2 flex items-center gap-2 [dir='rtl']:flex-row-reverse">
                    <Filter size={16} /> {t('filter.conflicts')}
                  </h3>
                  <div className="flex flex-wrap gap-2 [dir='rtl']:flex-row-reverse">
                    {conflicts.map(conflict => (
                      <button
                        key={conflict.cellRef}
                        onClick={() => toggleConflictFilter(conflict.cellRef)}
                        className={`px-3 py-1 rounded-full text-sm ${
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
