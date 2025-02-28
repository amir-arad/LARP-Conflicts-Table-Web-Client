# LARP Conflicts Table Web Client Documentation

## Overview

Welcome to the documentation for the LARP Conflicts Table Web Client. This comprehensive guide provides insights into the project's architecture, features, testing strategies, and backend integrations.

## Documentation Structure

### [Product](/product)

- [Vision](product/vision.md) - Project vision and goals
- [Features](product/features.md) - Feature catalog
  - [Authentication](product/features/authentication.md)
  - [Conflicts Table](product/features/conflicts-table.md)
  - [Real-time Collaboration](product/features/real-time-collaboration.md)
  - [Internationalization](product/features/internationalization.md)
- [User Experience](product/ux.md) - UX design and principles
  - [Authentication Flow](product/ux/authentication-flow.md)
  - [Table Interaction](product/ux/table-interaction.md)

### [Architecture](/architecture)

- [Overview](architecture/overview.md) - System architecture overview
- [Components](architecture/components.md) - Component architecture
  - [ConflictsTableTool](architecture/components/conflicts-table-tool.md)
  - [AuthContext](architecture/components/auth-context.md)
  - [FirebaseContext](architecture/components/firebase-context.md)
  - [GoogleSheetsContext](architecture/components/google-sheets-context.md)
  - [LanguageContext](architecture/components/language-context.md)
- [Patterns](architecture/patterns.md) - Implementation patterns
- [Firebase Integration](architecture/firebase-integration.md)
- [Google Sheets Integration](architecture/google-sheets-integration.md)

### [Backend Integrations](/backends)

- [Firebase](backends/firebase/setup.md) - Firebase setup and configuration
- [Google Sheets](backends/google-sheets/api-setup.md) - Google Sheets API setup
- [Integration Testing Strategy](backends/integration-testing-strategy.md)

### [Features Implementation](/features)

- [Authentication](features/auth/auth-flow.md)
- [Collaboration](features/collaboration/)
  - [Feature Analysis](features/collaboration/collaboration-feature-analysis.md)
  - [Roadmap](features/collaboration/collaboration-roadmap.md)
  - [UX Design](features/collaboration/collaboration-ux.md)
  - [Lock Mechanism](features/collaboration/lock-mechanism-implementation-plan.md)
- [Motivation](features/motivation/)
  - [Edit Flow](features/motivation/edit-flow-implementation-guide.md)
  - [Test Plan](features/motivation/test-plan.md)
- [Roles](features/roles/)
  - [Implementation Guide](features/roles/test-implementation-guide.md)
  - [Test Plan](features/roles/test-plan.md)

## Current Development Status

### Implemented Features

- ✅ Firebase Infrastructure
- ✅ Authentication Flow
- ✅ Presence System
- ✅ Lock Mechanism
- ✅ Real-time Collaboration
- ✅ Internationalization (English and Hebrew)

### Testing Strategy

- Comprehensive integration test coverage
- Storybook-exclusive UI testing
- Mock-driven development approach

## Contributing

Please refer to individual section README files for detailed information about each area of the project.

## Version

Last updated: 2/28/2025
