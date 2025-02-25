export const sheetFixtures = {
  basic: [
    ['', 'Role 1', 'Role 2'],
    ['Conflict 1', 'M1-1', 'M1-2'],
    ['Conflict 2', 'M2-1', 'M2-2'],
  ],
  empty: [['']],
  withManyRoles: [
    ['', 'Role 1', 'Role 2', 'Role 3', 'Role 4', 'Role 5'],
    ['Conflict 1', 'M1-1', 'M1-2', 'M1-3', 'M1-4', 'M1-5'],
  ],
  withManyConflicts: [
    ['', 'Role 1', 'Role 2'],
    ['Conflict 1', 'M1-1', 'M1-2'],
    ['Conflict 2', 'M2-1', 'M2-2'],
    ['Conflict 3', 'M3-1', 'M3-2'],
    ['Conflict 4', 'M4-1', 'M4-2'],
    ['Conflict 5', 'M5-1', 'M5-2'],
  ],
};
