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
3. Run tests before submitting changes
4. Format your code before committing:

```bash
npm run format && npm run lint
```
