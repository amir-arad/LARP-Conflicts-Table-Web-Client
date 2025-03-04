# Documentation Generation Build Step Plan

Based on my analysis of the LARP Conflicts Table Web Client project, I'll create a comprehensive plan for implementing an automated documentation generation build step. This will enhance the existing documentation strategy by automatically extracting information from the source code.

## Current Documentation Status

- Well-organized manual documentation in `/docs` directory
- No automated documentation generation tools currently in place
- No JSDoc comments in the codebase
- Testing infrastructure using Vitest and Storybook

## Documentation Generation Goals

1. Automatically generate technical documentation from source code
2. Create comprehensive API documentation
3. Generate dependency graphs and architectural diagrams
4. Produce code coverage reports
5. Organize documentation in a searchable, well-structured format
6. Integrate with existing documentation strategy

## Proposed Documentation Tools

| Tool               | Purpose                      | Output         |
| ------------------ | ---------------------------- | -------------- |
| TypeDoc            | TypeScript API documentation | HTML/Markdown  |
| JSDoc              | JavaScript documentation     | HTML           |
| Dependency Cruiser | Dependency graphs            | SVG/DOT/HTML   |
| Vitest Coverage    | Code coverage reports        | HTML/JSON      |
| Compodoc           | Component documentation      | HTML           |
| PlantUML           | Architectural diagrams       | SVG/PNG        |
| Docusaurus         | Documentation website        | Static website |

## Implementation Plan

### 1. Add Documentation Generation Tools

First, we'll add the necessary documentation generation tools to the project:

```bash
npm install --save-dev typedoc jsdoc @compodoc/compodoc dependency-cruiser @docusaurus/core @docusaurus/preset-classic plantuml-encoder
```

### 2. Configure TypeDoc for TypeScript Documentation

TypeDoc will generate API documentation from TypeScript code:

```json
// typedoc.json
{
  "entryPoints": ["src"],
  "entryPointStrategy": "expand",
  "out": "generated-docs/api",
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "includeVersion": true,
  "categorizeByGroup": true,
  "categoryOrder": ["Contexts", "Components", "Hooks", "Utilities", "*"],
  "readme": "none",
  "plugin": ["typedoc-plugin-markdown"],
  "theme": "default"
}
```

### 3. Configure JSDoc for JavaScript Documentation

JSDoc will be used for any JavaScript files and to enhance TypeScript documentation:

```json
// jsdoc.json
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

### 4. Configure Compodoc for Component Documentation

Compodoc will generate detailed documentation for React components:

```json
// .compodocrc.json
{
  "tsconfig": "tsconfig.json",
  "output": "generated-docs/components",
  "disableSourceCode": false,
  "disableCoverage": false,
  "disablePrivate": true,
  "disableProtected": false,
  "disableInternal": true,
  "disableLifeCycleHooks": false,
  "disableRoutesGraph": false,
  "disableGraph": false,
  "language": "en-US",
  "theme": "material"
}
```

### 5. Configure Dependency Cruiser for Dependency Graphs

Dependency Cruiser will generate dependency graphs for the project:

```javascript
// dependency-cruiser.config.js
module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        '^node_modules',
        '\\.(test|spec)\\.(js|ts|tsx)$',
        '\\.(stories)\\.(js|ts|tsx)$',
      ],
    },
    includeOnly: {
      path: ['^src'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            rankdir: 'LR',
            splines: 'ortho',
          },
        },
      },
      archi: {
        collapsePattern: '^src/[^/]+|^src/components/ui/[^/]+',
      },
      text: {
        highlightPathsInColor: true,
      },
    },
  },
};
```

### 6. Configure PlantUML for Architectural Diagrams

We'll create a script to generate PlantUML diagrams from source code structure:

```javascript
// scripts/generate-plantuml.js
const fs = require('fs');
const path = require('path');
const plantumlEncoder = require('plantuml-encoder');

// Generate component diagram
const generateComponentDiagram = () => {
  let diagram = '@startuml\n';
  diagram += 'title Component Diagram\n';
  diagram += 'skinparam componentStyle rectangle\n\n';

  // Add components based on src/components directory
  // ...

  diagram += '@enduml';

  const encoded = plantumlEncoder.encode(diagram);
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  return { diagram, url };
};

// Generate context diagram
const generateContextDiagram = () => {
  // Similar implementation for contexts
};

// Generate hooks diagram
const generateHooksDiagram = () => {
  // Similar implementation for hooks
};

// Save diagrams
const outputDir = 'generated-docs/diagrams';
fs.mkdirSync(outputDir, { recursive: true });

const componentDiagram = generateComponentDiagram();
fs.writeFileSync(
  path.join(outputDir, 'component-diagram.puml'),
  componentDiagram.diagram
);
fs.writeFileSync(
  path.join(outputDir, 'component-diagram-url.txt'),
  componentDiagram.url
);

// Save other diagrams similarly
```

### 7. Configure Docusaurus for Documentation Website

Docusaurus will be used to create a searchable documentation website:

```javascript
// docusaurus.config.js
module.exports = {
  title: 'LARP Conflicts Table Documentation',
  tagline: 'Technical documentation for the LARP Conflicts Table Web Client',
  url: 'https://your-domain.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'your-org',
  projectName: 'larp-conflicts-table-web-client',
  themeConfig: {
    navbar: {
      title: 'LARP Conflicts Table',
      logo: {
        alt: 'LARP Conflicts Table Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/product/vision',
          activeBasePath: 'docs/product',
          label: 'Product',
          position: 'left',
        },
        {
          to: 'docs/architecture/overview',
          activeBasePath: 'docs/architecture',
          label: 'Architecture',
          position: 'left',
        },
        {
          to: 'docs/api',
          activeBasePath: 'docs/api',
          label: 'API',
          position: 'left',
        },
        {
          to: 'docs/components',
          activeBasePath: 'docs/components',
          label: 'Components',
          position: 'left',
        },
        {
          to: 'docs/testing',
          activeBasePath: 'docs/testing',
          label: 'Testing',
          position: 'left',
        },
        {
          to: 'docs/coverage',
          activeBasePath: 'docs/coverage',
          label: 'Coverage',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Product',
              to: 'docs/product/vision',
            },
            {
              label: 'Architecture',
              to: 'docs/architecture/overview',
            },
          ],
        },
        {
          title: 'API',
          items: [
            {
              label: 'Components',
              to: 'docs/components',
            },
            {
              label: 'Hooks',
              to: 'docs/api/hooks',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Your Organization. Built with Docusaurus.`,
    },
    algolia: {
      // Algolia search configuration (optional)
      apiKey: 'YOUR_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
      contextualSearch: true,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/your-org/larp-conflicts-table-web-client/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
```

### 8. Create Documentation Generation Scripts

Add the following scripts to package.json:

```json
"scripts": {
  // Existing scripts...
  "docs:typedoc": "typedoc",
  "docs:jsdoc": "jsdoc -c jsdoc.json",
  "docs:compodoc": "compodoc -c .compodocrc.json",
  "docs:dependencies": "depcruise --include-only '^src' --output-type dot src | dot -T svg > generated-docs/diagrams/dependency-graph.svg",
  "docs:module-graph": "depcruise --include-only '^src' --output-type archi src | dot -T svg > generated-docs/diagrams/module-graph.svg",
  "docs:plantuml": "node scripts/generate-plantuml.js",
  "docs:coverage": "vitest run --coverage && cp -r coverage/html generated-docs/coverage",
  "docs:docusaurus": "docusaurus build",
  "docs:prepare": "mkdir -p generated-docs && mkdir -p generated-docs/api generated-docs/jsdoc generated-docs/components generated-docs/diagrams generated-docs/coverage",
  "docs:generate": "npm run docs:prepare && npm run docs:typedoc && npm run docs:jsdoc && npm run docs:compodoc && npm run docs:dependencies && npm run docs:module-graph && npm run docs:plantuml && npm run docs:coverage",
  "docs:serve": "docusaurus serve",
  "docs": "npm run docs:generate && npm run docs:docusaurus"
}
```

### 9. Create Documentation Integration Script

Create a script to integrate generated documentation with existing documentation:

```javascript
// scripts/integrate-docs.js
const fs = require('fs');
const path = require('path');

// Copy existing documentation to Docusaurus
const docsDir = path.join(__dirname, '..', 'docs');
const docusaurusDocsDir = path.join(__dirname, '..', 'docusaurus', 'docs');

// Copy product documentation
fs.cpSync(
  path.join(docsDir, 'product'),
  path.join(docusaurusDocsDir, 'product'),
  { recursive: true }
);

// Copy architecture documentation
fs.cpSync(
  path.join(docsDir, 'architecture'),
  path.join(docusaurusDocsDir, 'architecture'),
  { recursive: true }
);

// Copy testing documentation
fs.cpSync(
  path.join(docsDir, 'testing'),
  path.join(docusaurusDocsDir, 'testing'),
  { recursive: true }
);

// Copy generated API documentation
fs.cpSync(
  path.join(__dirname, '..', 'generated-docs', 'api'),
  path.join(docusaurusDocsDir, 'api'),
  { recursive: true }
);

// Copy generated component documentation
fs.cpSync(
  path.join(__dirname, '..', 'generated-docs', 'components'),
  path.join(docusaurusDocsDir, 'components'),
  { recursive: true }
);

// Copy generated diagrams
fs.cpSync(
  path.join(__dirname, '..', 'generated-docs', 'diagrams'),
  path.join(docusaurusDocsDir, 'diagrams'),
  { recursive: true }
);

// Copy coverage reports
fs.cpSync(
  path.join(__dirname, '..', 'generated-docs', 'coverage'),
  path.join(docusaurusDocsDir, 'coverage'),
  { recursive: true }
);

console.log('Documentation integration complete!');
```

### 10. Add JSDoc Comments to Codebase

To maximize the value of the documentation generation tools, we'll need to add JSDoc comments to the codebase. Here's an example of how to document a component:

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

And for a hook:

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

### 11. Create Documentation Guidelines

Create a documentation guideline document to ensure consistent documentation:

````markdown
# Documentation Guidelines

## JSDoc Comments

All components, hooks, contexts, and utility functions should be documented using JSDoc comments.

### Components

````typescript
/**
 * ComponentName
 *
 * @component
 * @description Brief description of the component
 *
 * @param {Type} propName - Description of the prop
 * @returns {JSX.Element} Component JSX
 *
 * @example
 * ```tsx
 * <ComponentName propName={value} />
 * ```
 */
````
````

### Hooks

````typescript
/**
 * useHookName
 *
 * @hook
 * @description Brief description of the hook
 *
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 *
 * @example
 * ```tsx
 * const result = useHookName(param);
 * ```
 */
````

### Contexts

````typescript
/**
 * ContextName
 *
 * @context
 * @description Brief description of the context
 *
 * @example
 * ```tsx
 * <ContextProvider>
 *   <ChildComponent />
 * </ContextProvider>
 * ```
 */
````

### Utility Functions

````typescript
/**
 * functionName
 *
 * @function
 * @description Brief description of the function
 *
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 *
 * @example
 * ```ts
 * const result = functionName(param);
 * ```
 */
````

## Diagrams

Use PlantUML for creating architectural diagrams. Place diagram source files in the `docs/diagrams` directory.

## Cross-References

Use relative paths for linking between documentation files. Don't include the `.md` extension in links.

## Documentation Structure

Follow the existing documentation structure:

- `/docs/product/` - Product documentation
- `/docs/architecture/` - Architecture documentation
- `/docs/testing/` - Testing documentation
- `/docs/api/` - API documentation (generated)
- `/docs/components/` - Component documentation (generated)
- `/docs/diagrams/` - Architectural diagrams (generated)
- `/docs/coverage/` - Code coverage reports (generated)

````

### 12. Integrate with CI/CD Pipeline

Add documentation generation to the CI/CD pipeline:

```yaml
# .github/workflows/docs.yml
name: Generate Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm ci
      - name: Generate documentation
        run: npm run docs
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
````

## Implementation Steps

1. **Initial Setup (Week 1)**

   - Install documentation generation tools
   - Create configuration files
   - Add scripts to package.json
   - Create documentation guidelines

2. **JSDoc Implementation (Week 2-3)**

   - Add JSDoc comments to components
   - Add JSDoc comments to hooks
   - Add JSDoc comments to contexts
   - Add JSDoc comments to utility functions

3. **Diagram Generation (Week 4)**

   - Create PlantUML diagram generation scripts
   - Generate component diagrams
   - Generate context diagrams
   - Generate data flow diagrams

4. **Documentation Integration (Week 5)**

   - Set up Docusaurus
   - Integrate existing documentation
   - Integrate generated documentation
   - Create cross-references

5. **Testing and Refinement (Week 6)**

   - Test documentation generation
   - Refine documentation structure
   - Improve search functionality
   - Add examples and tutorials

6. **CI/CD Integration (Week 7)**
   - Add documentation generation to CI/CD pipeline
   - Set up automatic deployment
   - Create documentation update workflow

## Benefits

1. **Improved Developer Onboarding**

   - Comprehensive API documentation
   - Clear component structure
   - Visual representation of architecture

2. **Better Maintenance**

   - Up-to-date documentation
   - Automated generation reduces manual effort
   - Consistent documentation format

3. **Enhanced Collaboration**

   - Shared understanding of codebase
   - Clear API contracts
   - Visual representation of dependencies

4. **Quality Assurance**
   - Code coverage reports
   - Documentation coverage
   - Consistent documentation standards
