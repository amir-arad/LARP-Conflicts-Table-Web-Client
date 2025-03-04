# TypeDoc Configuration

This file provides the configuration for TypeDoc, which will generate API documentation from TypeScript code.

## Configuration File: `typedoc.json`

```json
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

## Installation

To install TypeDoc and the Markdown plugin:

```bash
npm install --save-dev typedoc typedoc-plugin-markdown
```

## Usage

Add the following script to your `package.json`:

```json
"scripts": {
  "docs:typedoc": "typedoc"
}
```

Then run:

```bash
npm run docs:typedoc
```

## Output

TypeDoc will generate documentation in the `generated-docs/api` directory. The documentation will be organized by category, with Contexts, Components, Hooks, and Utilities as the main categories.
