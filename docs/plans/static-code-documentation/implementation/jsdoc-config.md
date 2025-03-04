# JSDoc Configuration

This file provides the configuration for JSDoc, which will generate documentation from JavaScript and TypeScript code comments.

## Configuration File: `jsdoc.json`

```json
{
  "source": {
    "include": ["src"],
    "includePattern": "\\.(jsx|js|ts|tsx)$",
    "excludePattern": "(node_modules/|docs)"
  },
  "plugins": ["plugins/markdown"],
  "opts": {
    "destination": "generated-docs/jsdoc",
    "recurse": true,
    "template": "node_modules/better-docs"
  },
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

## Installation

To install JSDoc and the better-docs template:

```bash
npm install --save-dev jsdoc better-docs
```

## Usage

Add the following script to your `package.json`:

```json
"scripts": {
  "docs:jsdoc": "jsdoc -c jsdoc.json"
}
```

Then run:

```bash
npm run docs:jsdoc
```

## Output

JSDoc will generate documentation in the `generated-docs/jsdoc` directory. The documentation will include all JavaScript and TypeScript files in the `src` directory, excluding files in the `node_modules` and `docs` directories.

## JSDoc Comment Examples

### Component Documentation

````typescript
/**
 * ConflictsTableTool Component
 *
 * @component
 * @description A tool for managing LARP character conflicts and motivations
 *
 * @example
 * ```tsx
 * <ConflictsTableTool />
 * ```
 *
 * @remarks
 * This component is the main entry point for the conflicts table functionality.
 * It integrates with Firebase for real-time collaboration and Google Sheets for data storage.
 */
export const ConflictsTableTool: React.FC = () => {
  // Component implementation
};
````

### Hook Documentation

````typescript
/**
 * useConflictsTable Hook
 *
 * @hook
 * @description Hook for managing conflicts table data and operations
 *
 * @returns {Object} Conflicts table state and operations
 * @returns {Array} conflicts - Array of conflict objects
 * @returns {Function} addConflict - Function to add a new conflict
 * @returns {Function} updateConflict - Function to update an existing conflict
 * @returns {Function} removeConflict - Function to remove a conflict
 *
 * @example
 * ```tsx
 * const { conflicts, addConflict, updateConflict, removeConflict } = useConflictsTable();
 * ```
 */
export const useConflictsTable = () => {
  // Hook implementation
};
````

### Context Documentation

````typescript
/**
 * FirebaseContext
 *
 * @context
 * @description Context for Firebase integration
 *
 * @example
 * ```tsx
 * <FirebaseProvider>
 *   <App />
 * </FirebaseProvider>
 * ```
 */
export const FirebaseContext = createContext<FirebaseContextType | null>(null);
````

### Utility Function Documentation

````typescript
/**
 * formatDate
 *
 * @function
 * @description Format a date string
 *
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 *
 * @example
 * ```ts
 * const formattedDate = formatDate(new Date());
 * ```
 */
export const formatDate = (date: Date): string => {
  // Function implementation
};
````
