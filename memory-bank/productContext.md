## Product Overview

The LARP Conflicts Table Web Client is a collaborative web application that allows multiple users to simultaneously view and edit LARP character conflicts and motivations in real-time.

### Key Features

- Real-time collaborative editing
- Role-based access control
- Multi-language support
- Visual lock indicators for collaborative editing
- Live user presence indicators
- Responsive design for various device sizes

## Current Development Focus

### Collaboration Features Implementation

We are currently focused on implementing real-time collaboration features, with an emphasis on:

1. **Lock Visualization and Mechanism**: Allowing users to see when cells are being edited by others
2. **Presence System**: Showing which users are currently active
3. **Real-time Updates**: Ensuring all users see changes immediately

### Testing Strategy

#### UI Testing Evolution: Storybook-Exclusive Approach

We have made a strategic decision to use Storybook exclusively for all UI component and flow testing, moving away from traditional integration tests for UI verification. This approach offers several benefits:

- **Direct Visual Verification**: Enables immediate visual inspection of UI components
- **Interactive Testing**: Uses Storybook's play function for comprehensive user flow testing
- **Self-Documentation**: Serves as both test suite and living documentation
- **Isolated Testing**: Focuses on component-specific behavior without system dependencies
- **Visual Regression Detection**: Makes it easier to identify unintended UI changes

#### Core Testing Areas

1. **Role Management Testing**

   - Basic role operations
   - Data persistence verification
   - Collaborative editing scenarios
   - Error handling and recovery mechanisms

2. **Collaboration Feature Testing**

   - Real-time presence indicators
   - Lock state visualization
   - Collaborative editing workflows
   - Conflict resolution mechanisms

3. **Integration Testing**
   - Google Sheets integration
   - Firebase real-time database
   - Authentication flows
   - Multi-user scenarios

### Testing Infrastructure

- **Testing Tools**: Vitest, React Testing Library, Storybook
- **Mock Ecosystem**: Custom mock drivers for Firebase and Google Sheets
- **Testing Patterns**: Extended async handling, comprehensive error scenarios

## Implementation Roadmap

### Phase 1: Foundation (COMPLETED)

- Firebase infrastructure setup
- Authentication integration
- Basic collaboration contexts

### Phase 2: Real-time Features (IN PROGRESS)

- Presence system implementation (COMPLETED)
- Active users display (COMPLETED)
- Lock visualization implementation (VERIFICATION NEEDED)
- Lock mechanism implementation (PENDING)
- Cursor tracking (PLANNED)

### Phase 3: Polish & Performance

- Error handling improvements
- Performance optimization
- Edge case handling

## Memory Bank Files Structure

- **activeContext.md**: Current session context and immediate goals
- **productContext.md**: Project overview and long-term strategy
- **progress.md**: Detailed work completed and next steps
- **decisionLog.md**: Key architectural and implementation decisions
- **systemPatterns.md**: Reusable patterns and code snippets
