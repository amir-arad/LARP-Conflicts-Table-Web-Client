# Documentation Generation Build Step

This document explains how to use the documentation generation build step that has been implemented for the LARP Conflicts Table Web Client.

## Overview

The documentation generation build step automatically generates comprehensive technical documentation from the source code, including:

- TypeScript type definitions (using TypeDoc)
- JSDoc comments (using JSDoc, for JavaScript files only)
- Component documentation (using Compodoc)
- Architectural diagrams (using PlantUML)
- Code coverage reports (using Vitest)

## Prerequisites

Before running the documentation generation, ensure you have the following installed:

- Node.js 22 or later
- npm 10 or later

## Installation

To install the documentation generation dependencies, run:

```bash
npm install --legacy-peer-deps
```

This is necessary because some of the documentation tools have peer dependency conflicts with the current version of React.

## Running the Documentation Generation

To generate all documentation, run:

```bash
npm run docs
```

This will:

1. Create the necessary directories
2. Generate TypeDoc documentation
3. Generate JSDoc documentation (for JavaScript files only)
4. Generate Compodoc documentation
5. Generate PlantUML diagrams
6. Generate code coverage reports

## Viewing the Documentation

After running the documentation generation, you can view the documentation by opening the following file in your browser:

```
generated-docs/index.html
```

This will provide access to all the generated documentation, including:

- API Documentation (TypeDoc, JSDoc, Compodoc)
- Architectural Diagrams (PlantUML)
- Code Coverage Reports (Vitest)

## Available Scripts

The following scripts are available for documentation generation:

- `npm run docs:prepare`: Create the necessary directories
- `npm run docs:typedoc`: Generate TypeDoc documentation
- `npm run docs:jsdoc`: Generate JSDoc documentation (for JavaScript files only)
- `npm run docs:compodoc`: Generate Compodoc documentation
- `npm run docs:plantuml`: Generate PlantUML diagrams
- `npm run docs:coverage`: Generate code coverage reports
- `npm run docs:generate`: Run all documentation generation scripts
- `npm run docs`: Run all documentation generation scripts

## Adding JSDoc Comments

To maximize the value of the documentation generation, add JSDoc comments to your code. Here are some examples:

### Components

````typescript
/**
 * ConflictsTableTool Component
 *
 * @component
 * @description A tool for managing LARP character conflicts and motivations
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
 */
````

### Hooks

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
 *
 * @example
 * ```tsx
 * const { conflicts, addConflict } = useConflictsTable();
 * ```
 */
````

### Contexts

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
````

### Utility Functions

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
````

## Configuration Files

The documentation generation uses the following configuration files:

- `typedoc.json`: Configuration for TypeDoc
- `jsdoc.json`: Configuration for JSDoc
- `.compodocrc.json`: Configuration for Compodoc
- `dependency-cruiser.config.js`: Configuration for Dependency Cruiser

## Scripts

The documentation generation uses the following scripts:

- `scripts/generate-plantuml.js`: Script for generating PlantUML diagrams

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts when installing the documentation tools, use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

This is necessary because some of the documentation tools have peer dependency conflicts with the current version of React.

### TypeScript Files and JSDoc

JSDoc does not natively support TypeScript files. The documentation generation build step has been configured to:

1. Use TypeDoc for TypeScript files (`.ts`, `.tsx`)
2. Use JSDoc for JavaScript files only (`.js`, `.jsx`)

If you see errors like `Unexpected reserved word 'interface'` during JSDoc generation, these can be safely ignored as they are related to TypeScript files that JSDoc cannot parse.

### Windows-Specific Issues

The documentation generation scripts have been updated to work on Windows. If you encounter any issues with directory creation, check the `docs:prepare` script in `package.json`.

### GraphViz Installation

For dependency graph generation, you need to install GraphViz:

- Windows: Download from https://graphviz.org/download/ and add to PATH
- macOS: `brew install graphviz`
- Linux: `apt-get install graphviz` or equivalent

If GraphViz is not installed, the dependency graph generation will be skipped, but the rest of the documentation will still be generated.

## Future Improvements

- Add GraphViz installation for dependency graph generation
- Integrate with CI/CD pipeline for automatic documentation generation
- Add search functionality to the documentation website
- Add versioning for documentation
- Add TypeScript support for JSDoc using a TypeScript-compatible JSDoc parser
