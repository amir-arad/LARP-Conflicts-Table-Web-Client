# Backend Integrations

This directory contains documentation for backend services and integrations used in the LARP Conflicts Table Web Client.

## Contents

### Firebase Integration

- [Setup Guide](firebase/setup.md) - Firebase project setup and configuration
- [README](firebase/README.md) - Firebase integration overview

### Google Sheets Integration

- [API Setup](google-sheets/api-setup.md) - Google Sheets API setup and configuration
- [OAuth Test](google-sheets/oauth-test.md) - OAuth authentication testing
- [README](google-sheets/README.md) - Google Sheets integration overview

### Testing

- [Integration Testing Strategy](integration-testing-strategy.md) - Strategy for testing backend integrations

## Architecture References

For detailed technical documentation about how these backends are integrated into the application architecture, see:

- [Firebase Integration Architecture](../architecture/firebase-integration.md)
- [Google Sheets Integration Architecture](../architecture/google-sheets-integration.md)

## Features Using These Backends

- Authentication (Firebase)
- Real-time Collaboration (Firebase)
  - User Presence
  - Cell Locking
- Data Storage (Google Sheets)
  - Roles
  - Conflicts
  - Motivations
