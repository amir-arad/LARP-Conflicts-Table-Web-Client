# PlantUML Script for Architectural Diagrams

This file provides a script for generating PlantUML diagrams from the project's source code structure.

## Script File: `scripts/generate-plantuml.js`

```javascript
const fs = require('fs');
const path = require('path');
const plantumlEncoder = require('plantuml-encoder');

// Helper function to read directory structure
const readDirStructure = (dir, baseDir = '') => {
  const items = fs.readdirSync(dir);
  const result = {};

  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const relativePath = path.join(baseDir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      result[item] = readDirStructure(itemPath, relativePath);
    } else if (stats.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
      result[item] = { type: 'file', path: relativePath };
    }
  });

  return result;
};

// Generate component diagram
const generateComponentDiagram = () => {
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  const componentStructure = readDirStructure(componentsDir, 'components');

  let diagram = '@startuml\n';
  diagram += 'title Component Diagram\n';
  diagram += 'skinparam componentStyle rectangle\n\n';

  // Add components
  Object.keys(componentStructure).forEach(component => {
    if (component === 'ui') {
      diagram += 'package "UI Components" {\n';
      Object.keys(componentStructure[component]).forEach(uiComponent => {
        const name = uiComponent.replace(/\.tsx$/, '');
        diagram += `  component "${name}" as UI_${name}\n`;
      });
      diagram += '}\n\n';
    } else {
      const name = component.replace(/\.tsx$/, '');
      diagram += `component "${name}" as ${name}\n`;
    }
  });

  // Add relationships (this would require parsing imports)
  // For simplicity, we'll add some example relationships
  diagram += '\n// Example relationships\n';
  diagram += 'conflicts-table-tool --> UI_table-cell\n';
  diagram += 'conflicts-table-tool --> UI_motivation-table-cell\n';

  diagram += '@enduml';

  const encoded = plantumlEncoder.encode(diagram);
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  return { diagram, url };
};

// Generate context diagram
const generateContextDiagram = () => {
  const contextsDir = path.join(__dirname, '..', 'src', 'contexts');
  const contextStructure = readDirStructure(contextsDir, 'contexts');

  let diagram = '@startuml\n';
  diagram += 'title Context Diagram\n';
  diagram += 'skinparam componentStyle rectangle\n\n';

  // Add contexts
  Object.keys(contextStructure).forEach(context => {
    const name = context.replace(/\.tsx$/, '');
    if (!name.includes('.test')) {
      diagram += `component "${name}" as ${name}\n`;
    }
  });

  // Add relationships (this would require parsing imports)
  // For simplicity, we'll add some example relationships
  diagram += '\n// Example relationships\n';
  diagram += 'AuthContext --> FirebaseContext\n';
  diagram += 'GoogleSheetsContext --> AuthContext\n';

  diagram += '@enduml';

  const encoded = plantumlEncoder.encode(diagram);
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  return { diagram, url };
};

// Generate hooks diagram
const generateHooksDiagram = () => {
  const hooksDir = path.join(__dirname, '..', 'src', 'hooks');
  const hooksStructure = readDirStructure(hooksDir, 'hooks');

  let diagram = '@startuml\n';
  diagram += 'title Hooks Diagram\n';
  diagram += 'skinparam componentStyle rectangle\n\n';

  // Add hooks
  Object.keys(hooksStructure).forEach(hook => {
    const name = hook.replace(/\.tsx?$/, '');
    if (!name.includes('.test')) {
      diagram += `component "${name}" as ${name}\n`;
    }
  });

  // Add relationships (this would require parsing imports)
  // For simplicity, we'll add some example relationships
  diagram += '\n// Example relationships\n';
  diagram += 'useConflictsTable --> useGoogleSheet\n';
  diagram += 'usePresence --> useFlags\n';

  diagram += '@enduml';

  const encoded = plantumlEncoder.encode(diagram);
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  return { diagram, url };
};

// Generate data flow diagram
const generateDataFlowDiagram = () => {
  let diagram = '@startuml\n';
  diagram += 'title Data Flow Diagram\n';
  diagram += 'skinparam componentStyle rectangle\n\n';

  // Add components
  diagram += 'actor User\n';
  diagram += 'component "Conflicts Table Tool" as ConflictsTable\n';
  diagram += 'database "Google Sheets" as GoogleSheets\n';
  diagram += 'database "Firebase" as Firebase\n';

  // Add data flows
  diagram += '\n// Data flows\n';
  diagram += 'User -> ConflictsTable: Input\n';
  diagram += 'ConflictsTable -> GoogleSheets: Read/Write Data\n';
  diagram += 'ConflictsTable -> Firebase: Real-time Updates\n';
  diagram += 'Firebase -> ConflictsTable: Sync Changes\n';

  diagram += '@enduml';

  const encoded = plantumlEncoder.encode(diagram);
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

  return { diagram, url };
};

// Save diagrams
const outputDir = path.join(__dirname, '..', 'generated-docs', 'diagrams');
fs.mkdirSync(outputDir, { recursive: true });

// Generate and save component diagram
const componentDiagram = generateComponentDiagram();
fs.writeFileSync(
  path.join(outputDir, 'component-diagram.puml'),
  componentDiagram.diagram
);
fs.writeFileSync(
  path.join(outputDir, 'component-diagram-url.txt'),
  componentDiagram.url
);

// Generate and save context diagram
const contextDiagram = generateContextDiagram();
fs.writeFileSync(
  path.join(outputDir, 'context-diagram.puml'),
  contextDiagram.diagram
);
fs.writeFileSync(
  path.join(outputDir, 'context-diagram-url.txt'),
  contextDiagram.url
);

// Generate and save hooks diagram
const hooksDiagram = generateHooksDiagram();
fs.writeFileSync(
  path.join(outputDir, 'hooks-diagram.puml'),
  hooksDiagram.diagram
);
fs.writeFileSync(
  path.join(outputDir, 'hooks-diagram-url.txt'),
  hooksDiagram.url
);

// Generate and save data flow diagram
const dataFlowDiagram = generateDataFlowDiagram();
fs.writeFileSync(
  path.join(outputDir, 'data-flow-diagram.puml'),
  dataFlowDiagram.diagram
);
fs.writeFileSync(
  path.join(outputDir, 'data-flow-diagram-url.txt'),
  dataFlowDiagram.url
);

console.log('PlantUML diagrams generated successfully!');
```

## Installation

To install the required dependencies:

```bash
npm install --save-dev plantuml-encoder
```

## Usage

Add the following script to your `package.json`:

```json
"scripts": {
  "docs:plantuml": "node scripts/generate-plantuml.js"
}
```

Then run:

```bash
npm run docs:plantuml
```

## Output

The script will generate the following diagrams:

1. **Component Diagram**: Shows the components in the `src/components` directory and their relationships. Saved as `generated-docs/diagrams/component-diagram.puml` and accessible via the URL in `component-diagram-url.txt`.

2. **Context Diagram**: Shows the contexts in the `src/contexts` directory and their relationships. Saved as `generated-docs/diagrams/context-diagram.puml` and accessible via the URL in `context-diagram-url.txt`.

3. **Hooks Diagram**: Shows the hooks in the `src/hooks` directory and their relationships. Saved as `generated-docs/diagrams/hooks-diagram.puml` and accessible via the URL in `hooks-diagram-url.txt`.

4. **Data Flow Diagram**: Shows the data flow between the user, the Conflicts Table Tool, Google Sheets, and Firebase. Saved as `generated-docs/diagrams/data-flow-diagram.puml` and accessible via the URL in `data-flow-diagram-url.txt`.

## Features

PlantUML provides several features for creating architectural diagrams:

1. **Component Diagrams**: Show components and their relationships
2. **Sequence Diagrams**: Show interactions between components over time
3. **Class Diagrams**: Show classes and their relationships
4. **Activity Diagrams**: Show workflows and processes
5. **State Diagrams**: Show states and transitions
6. **Use Case Diagrams**: Show actors and use cases

## Integration with Other Documentation Tools

The PlantUML diagrams can be included in the documentation website to provide a visual representation of the project's architecture. The SVG files can be embedded directly in Markdown files or included in the Docusaurus website.
