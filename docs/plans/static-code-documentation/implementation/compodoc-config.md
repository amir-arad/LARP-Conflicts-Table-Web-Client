# Compodoc Configuration

This file provides the configuration for Compodoc, which will generate detailed documentation for React components.

## Configuration File: `.compodocrc.json`

```json
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

## Installation

To install Compodoc:

```bash
npm install --save-dev @compodoc/compodoc
```

## Usage

Add the following script to your `package.json`:

```json
"scripts": {
  "docs:compodoc": "compodoc -c .compodocrc.json"
}
```

Then run:

```bash
npm run docs:compodoc
```

## Output

Compodoc will generate documentation in the `generated-docs/components` directory. The documentation will include:

- Component details
- Component dependencies
- Component usage examples
- Component properties
- Component methods
- Component events
- Component source code (if not disabled)
- Component coverage (if not disabled)

## Features

Compodoc provides several features for React component documentation:

1. **Component Graphs**: Visual representation of component relationships
2. **Coverage Reports**: Code coverage information for components
3. **Source Code Viewer**: View component source code directly in the documentation
4. **Search Functionality**: Search for components, methods, and properties
5. **Responsive Design**: Documentation is accessible on all devices
6. **Customizable Themes**: Choose from several built-in themes or create your own

## Integration with Other Documentation Tools

Compodoc can be integrated with other documentation tools like TypeDoc and JSDoc to provide a comprehensive documentation solution. The output from Compodoc can be included in a Docusaurus website along with other documentation.
