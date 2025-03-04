import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const createDirIfNotExists = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Copy directory recursively
const copyDirRecursive = (src, dest) => {
  createDirIfNotExists(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Paths
const docsDir = path.join(__dirname, '..', 'docs');
const generatedDocsDir = path.join(__dirname, '..', 'generated-docs');
const docusaurusDir = path.join(__dirname, '..', 'docusaurus');
const docusaurusDocsDir = path.join(docusaurusDir, 'docs');

// Create Docusaurus docs directory if it doesn't exist
createDirIfNotExists(docusaurusDocsDir);

// Copy existing documentation to Docusaurus

console.log('Copying existing documentation to Docusaurus...');

// Copy product documentation
if (fs.existsSync(path.join(docsDir, 'product'))) {
  copyDirRecursive(
    path.join(docsDir, 'product'),
    path.join(docusaurusDocsDir, 'product')
  );
}

// Copy architecture documentation
if (fs.existsSync(path.join(docsDir, 'architecture'))) {
  copyDirRecursive(
    path.join(docsDir, 'architecture'),
    path.join(docusaurusDocsDir, 'architecture')
  );
}

// Copy testing documentation
if (fs.existsSync(path.join(docsDir, 'testing'))) {
  copyDirRecursive(
    path.join(docsDir, 'testing'),
    path.join(docusaurusDocsDir, 'testing')
  );
}

// Copy generated documentation to Docusaurus

console.log('Copying generated documentation to Docusaurus...');

// Copy generated API documentation (TypeDoc)
if (fs.existsSync(path.join(generatedDocsDir, 'api'))) {
  copyDirRecursive(
    path.join(generatedDocsDir, 'api'),
    path.join(docusaurusDocsDir, 'api')
  );
}

// Copy generated component documentation (Compodoc)
if (fs.existsSync(path.join(generatedDocsDir, 'components'))) {
  copyDirRecursive(
    path.join(generatedDocsDir, 'components'),
    path.join(docusaurusDocsDir, 'components')
  );
}

// Copy generated diagrams (PlantUML and Dependency Cruiser)
createDirIfNotExists(path.join(docusaurusDocsDir, 'diagrams'));

// Copy PlantUML diagrams
const diagramsDir = path.join(generatedDocsDir, 'diagrams');
if (fs.existsSync(diagramsDir)) {
  const diagrams = fs.readdirSync(diagramsDir);

  for (const diagram of diagrams) {
    if (diagram.endsWith('.svg')) {
      const srcPath = path.join(diagramsDir, diagram);
      const destPath = path.join(docusaurusDocsDir, 'diagrams', diagram);
      fs.copyFileSync(srcPath, destPath);

      // Create Markdown file for the diagram
      const mdContent = `# ${diagram
        .replace('.svg', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l =>
          l.toUpperCase()
        )}\n\n![${diagram.replace('.svg', '')}](${diagram})\n`;
      fs.writeFileSync(
        path.join(
          docusaurusDocsDir,
          'diagrams',
          `${diagram.replace('.svg', '')}.md`
        ),
        mdContent
      );
    }
  }
}

// Copy coverage reports (Vitest)
if (fs.existsSync(path.join(generatedDocsDir, 'coverage'))) {
  copyDirRecursive(
    path.join(generatedDocsDir, 'coverage'),
    path.join(docusaurusDocsDir, 'coverage')
  );
}

// Create index files for each section

console.log('Creating index files...');

// Create API index file
const apiIndexContent = `# API Documentation

This section contains the API documentation for the LARP Conflicts Table Web Client.

## Components

The [Components](components/index) section contains documentation for React components.

## Hooks

The [Hooks](hooks/index) section contains documentation for React hooks.

## Contexts

The [Contexts](contexts/index) section contains documentation for React contexts.

## Utilities

The [Utilities](utilities/index) section contains documentation for utility functions.
`;
createDirIfNotExists(path.join(docusaurusDocsDir, 'api'));
fs.writeFileSync(
  path.join(docusaurusDocsDir, 'api', 'index.md'),
  apiIndexContent
);

// Create Components index file
const componentsIndexContent = `# Component Documentation

This section contains detailed documentation for the React components in the LARP Conflicts Table Web Client.

The documentation includes:

- Component properties
- Component methods
- Component events
- Component dependencies
- Component usage examples
`;
createDirIfNotExists(path.join(docusaurusDocsDir, 'components'));
fs.writeFileSync(
  path.join(docusaurusDocsDir, 'components', 'index.md'),
  componentsIndexContent
);

// Create Coverage index file
const coverageIndexContent = `# Code Coverage Reports

This section contains code coverage reports for the LARP Conflicts Table Web Client.

The reports show the percentage of code that is covered by tests, including:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
`;
createDirIfNotExists(path.join(docusaurusDocsDir, 'coverage'));
createDirIfNotExists(path.join(docusaurusDocsDir, 'coverage', 'html'));
fs.writeFileSync(
  path.join(docusaurusDocsDir, 'coverage', 'html', 'index.md'),
  coverageIndexContent
);

// Create Diagrams index file
const diagramsIndexContent = `# Architectural Diagrams

This section contains architectural diagrams for the LARP Conflicts Table Web Client.

## Component Diagrams

The [Component Diagram](component-diagram) shows the components in the application and their relationships.

## Context Diagrams

The [Context Diagram](context-diagram) shows the contexts in the application and their relationships.

## Hooks Diagrams

The [Hooks Diagram](hooks-diagram) shows the hooks in the application and their relationships.

## Data Flow Diagrams

The [Data Flow Diagram](data-flow-diagram) shows the data flow between the user, the Conflicts Table Tool, Google Sheets, and Firebase.

## Dependency Graphs

The [Dependency Graph](dependency-graph) shows the dependencies between files in the application.

## Module Graphs

The [Module Graph](module-graph) shows the dependencies between modules in the application.
`;
createDirIfNotExists(path.join(docusaurusDocsDir, 'diagrams'));
fs.writeFileSync(
  path.join(docusaurusDocsDir, 'diagrams', 'index.md'),
  diagramsIndexContent
);

console.log('Documentation integration complete!');
