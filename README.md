# LARP-Conflicts-Table-Web-Client

A web client for managing LARP conflicts tables, built with React, TypeScript, and Vite.

## Development Setup

### Prerequisites

- Node.js 22 or higher
- npm (comes with Node.js)
- VSCode (recommended)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for deployment
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run docs` - Generate documentation
- `npm run docs:generate` - Generate documentation without integration
- `npm run docs:typedoc` - Generate TypeScript API documentation
- `npm run docs:compodoc` - Generate component documentation
- `npm run docs:plantuml` - Generate architectural diagrams
- `npm run docs:coverage` - Generate code coverage reports

## Documentation

### Generated Documentation

The project uses automated tools to generate comprehensive documentation from the source code:

- **API Documentation:** Generated from TypeScript using TypeDoc
- **Component Documentation:** Generated using Compodoc
- **JavaScript Documentation:** Generated using JSDoc
- **Architectural Diagrams:** Generated using PlantUML
- **Code Coverage Reports:** Generated using Vitest

To generate all documentation:

```bash
npm run docs
```

Then open `generated-docs/index.html` in your browser.

For more information about the documentation generation process, see:

- [Documentation Build Step](docs/documentation-build-step.md)
- [Documentation Strategy](docs/documentation-strategy.md)

### Manual Documentation

The project's manual documentation is organized in the `docs` directory:

```
docs/
├── product/         # Product documentation
├── architecture/    # Architecture documentation
├── testing/        # Testing documentation
└── features/       # Feature documentation
```

## Code Quality Tools

### ESLint and Prettier Integration

This project uses ESLint for code linting and Prettier for code formatting. They are configured to work together seamlessly.

#### Configuration Files

- `.prettierrc.json` - Prettier configuration
- `eslint.config.js` - ESLint configuration
- `.vscode/settings.json` - VSCode editor settings

#### Automatic Formatting

If you're using VSCode:

- Files will be automatically formatted on save
- ESLint errors will be automatically fixed on save where possible
- Prettier is set as the default formatter for JavaScript, TypeScript, and other supported files

#### Manual Commands

- Format code:

```bash
npm run format
```

- Lint code with auto-fix:

```bash
npm run lint
```

#### Prettier Configuration

Key formatting rules:

- Semi-colons: enabled
- Single quotes: enabled
- Tab width: 2 spaces
- Print width: 80 characters
- Trailing commas: ES5
- Arrow function parentheses: avoid when possible
- End of line: auto

#### ESLint Configuration

The project uses:

- TypeScript ESLint rules
- React Hooks rules
- React Refresh rules
- Storybook rules
- Prettier integration

## Project Structure

```
src/
├── components/     # React components
│   └── ui/        # Reusable UI components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization
│   └── messages/  # Translation files
├── lib/           # Utility libraries
└── types/         # TypeScript type definitions
```

## Contributing

1. Ensure your code editor is configured to use ESLint and Prettier
2. Write code following the project's style guide (enforced by ESLint/Prettier)
3. Add JSDoc comments to your code for documentation generation
4. Run tests before submitting changes
5. Generate and review documentation:

```bash
npm run docs
```

6. Format your code before committing:

```bash
npm run format && npm run lint
```
