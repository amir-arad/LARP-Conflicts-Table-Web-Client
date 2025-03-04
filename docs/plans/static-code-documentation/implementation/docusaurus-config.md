# Docusaurus Configuration

This file provides the configuration for Docusaurus, which will create a searchable documentation website.

## Configuration File: `docusaurus.config.js`

```javascript
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

## Sidebar Configuration File: `sidebars.js`

```javascript
module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Product',
      items: [
        'product/vision',
        'product/features',
        {
          type: 'category',
          label: 'Features',
          items: [
            'product/features/authentication',
            'product/features/conflicts-table',
            'product/features/real-time-collaboration',
            'product/features/internationalization',
          ],
        },
        {
          type: 'category',
          label: 'User Experience',
          items: [
            'product/ux/authentication-flow',
            'product/ux/table-interaction',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/components',
        'architecture/patterns',
        'architecture/firebase-integration',
        'architecture/google-sheets-integration',
        {
          type: 'category',
          label: 'Components',
          items: [
            'architecture/components/conflicts-table-tool',
            'architecture/components/auth-context',
            'architecture/components/firebase-context',
            'architecture/components/google-sheets-context',
            'architecture/components/language-context',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/index',
        {
          type: 'category',
          label: 'Components',
          items: ['api/components/index'],
        },
        {
          type: 'category',
          label: 'Hooks',
          items: ['api/hooks/index'],
        },
        {
          type: 'category',
          label: 'Contexts',
          items: ['api/contexts/index'],
        },
        {
          type: 'category',
          label: 'Utilities',
          items: ['api/utilities/index'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: ['components/index'],
    },
    {
      type: 'category',
      label: 'Testing',
      items: ['testing/integration-testing', 'testing/google-oauth-testing'],
    },
    {
      type: 'category',
      label: 'Coverage',
      items: ['coverage/index'],
    },
    {
      type: 'category',
      label: 'Diagrams',
      items: [
        'diagrams/component-diagram',
        'diagrams/context-diagram',
        'diagrams/hooks-diagram',
        'diagrams/data-flow-diagram',
        'diagrams/dependency-graph',
        'diagrams/module-graph',
      ],
    },
  ],
};
```

## Installation

To install Docusaurus:

```bash
npm install --save-dev @docusaurus/core @docusaurus/preset-classic
```

## Usage

Add the following scripts to your `package.json`:

```json
"scripts": {
  "docs:docusaurus": "docusaurus build",
  "docs:serve": "docusaurus serve"
}
```

Then run:

```bash
npm run docs:docusaurus
npm run docs:serve
```

## Output

Docusaurus will generate a static website in the `build` directory. The website will include:

- Product documentation
- Architecture documentation
- API documentation (generated by TypeDoc)
- Component documentation (generated by Compodoc)
- Testing documentation
- Coverage reports (generated by Vitest)
- Architectural diagrams (generated by PlantUML and Dependency Cruiser)

## Features

Docusaurus provides several features for documentation websites:

1. **Search**: Built-in search functionality (can be enhanced with Algolia DocSearch)
2. **Versioning**: Support for versioned documentation
3. **Internationalization**: Support for multiple languages
4. **Theming**: Customizable themes
5. **MDX**: Support for MDX (Markdown + JSX)
6. **Plugins**: Extensible plugin system

## Integration with Other Documentation Tools

Docusaurus can integrate with other documentation tools by including their output in the documentation website. The integration script (`scripts/integrate-docs.js`) copies the output from TypeDoc, Compodoc, PlantUML, and Vitest Coverage to the appropriate directories in the Docusaurus website.
