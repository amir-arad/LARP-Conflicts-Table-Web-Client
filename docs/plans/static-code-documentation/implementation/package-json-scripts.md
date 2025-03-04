# Package.json Scripts for Documentation Generation

This file provides the scripts to add to your `package.json` file for documentation generation.

## Scripts to Add to `package.json`

```json
"scripts": {
  // Existing scripts...

  // TypeDoc
  "docs:typedoc": "typedoc",

  // JSDoc
  "docs:jsdoc": "jsdoc -c jsdoc.json",

  // Compodoc
  "docs:compodoc": "compodoc -c .compodocrc.json",

  // Dependency Cruiser
  "docs:dependencies": "depcruise --include-only '^src' --output-type dot src | dot -T svg > generated-docs/diagrams/dependency-graph.svg",
  "docs:module-graph": "depcruise --include-only '^src' --output-type archi src | dot -T svg > generated-docs/diagrams/module-graph.svg",

  // PlantUML
  "docs:plantuml": "node scripts/generate-plantuml.js",

  // Vitest Coverage
  "docs:coverage": "vitest run --coverage && cp -r coverage/html generated-docs/coverage",

  // Docusaurus
  "docs:docusaurus": "docusaurus build",
  "docs:serve": "docusaurus serve",

  // Documentation Integration
  "docs:integrate": "node scripts/integrate-docs.js",

  // Preparation
  "docs:prepare": "mkdir -p generated-docs && mkdir -p generated-docs/api generated-docs/jsdoc generated-docs/components generated-docs/diagrams generated-docs/coverage",

  // Main Documentation Generation
  "docs:generate": "npm run docs:prepare && npm run docs:typedoc && npm run docs:jsdoc && npm run docs:compodoc && npm run docs:dependencies && npm run docs:module-graph && npm run docs:plantuml && npm run docs:coverage",

  // Complete Documentation Process
  "docs": "npm run docs:generate && npm run docs:integrate && npm run docs:docusaurus"
}
```

## Usage

To generate all documentation, run:

```bash
npm run docs
```

To generate specific parts of the documentation:

```bash
# Generate TypeDoc documentation
npm run docs:typedoc

# Generate JSDoc documentation
npm run docs:jsdoc

# Generate Compodoc documentation
npm run docs:compodoc

# Generate dependency graphs
npm run docs:dependencies
npm run docs:module-graph

# Generate PlantUML diagrams
npm run docs:plantuml

# Generate coverage reports
npm run docs:coverage

# Build Docusaurus website
npm run docs:docusaurus

# Serve Docusaurus website
npm run docs:serve
```

## Script Descriptions

1. **docs:typedoc**: Generates API documentation from TypeScript code using TypeDoc.

2. **docs:jsdoc**: Generates documentation from JavaScript and TypeScript code comments using JSDoc.

3. **docs:compodoc**: Generates detailed documentation for React components using Compodoc.

4. **docs:dependencies**: Generates a dependency graph showing all dependencies between files in the `src` directory.

5. **docs:module-graph**: Generates a high-level graph showing dependencies between modules (directories) in the `src` directory.

6. **docs:plantuml**: Generates PlantUML diagrams from the project's source code structure.

7. **docs:coverage**: Runs tests with coverage and copies the coverage reports to the generated documentation directory.

8. **docs:docusaurus**: Builds the Docusaurus website.

9. **docs:serve**: Serves the Docusaurus website locally.

10. **docs:integrate**: Integrates generated documentation with existing documentation in the Docusaurus website.

11. **docs:prepare**: Creates the necessary directories for generated documentation.

12. **docs:generate**: Runs all documentation generation scripts.

13. **docs**: Runs the complete documentation process, including generation, integration, and building the Docusaurus website.

## Integration with CI/CD

These scripts can be integrated into a CI/CD pipeline to automatically generate documentation when code is pushed to the repository. For example, in a GitHub Actions workflow:

```yaml
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
```
