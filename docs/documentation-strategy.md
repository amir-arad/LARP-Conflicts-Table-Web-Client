# Documentation Strategy

This document outlines the documentation strategy for the LARP Conflicts Table Tool.

## Core Principles

- **Technical Accuracy:** Documentation must accurately reflect the current implementation.
- **Relevance:** Focus on information that helps users understand and work with the system.
- **Context Over Trivia:** Prioritize explaining why things work the way they do over listing every detail.
- **Evolution Tracking:** Document key decisions and changes to help understand system evolution.
- **Implementation Focus:** Keep documentation closely tied to actual implementation.
- **Automated Generation:** Use automated tools to generate documentation from source code.

## Documentation Structure

### Product Documentation (`/docs/product/`)

- **Vision:** High-level product vision and goals
- **Features:** Detailed feature documentation
  - Authentication
  - Conflicts Table
  - Real-time Collaboration
  - Internationalization
- **User Experience:** User flows and interaction patterns
  - Authentication Flow
  - Table Interaction

### Architecture Documentation (`/docs/architecture/`)

- **Overview:** System architecture and data flow
- **Components:** Component-level documentation
  - ConflictsTableTool
  - Contexts (Auth, Firebase, Google Sheets, Language)
- **Patterns:** Implementation patterns and conventions
- **Integration:** External service integrations
  - Firebase Integration
  - Google Sheets Integration

### Testing Documentation (`/docs/testing/`)

- **Integration Testing:** Testing strategy and available tests
- **OAuth Testing:** Instructions for obtaining test tokens
- **Test Patterns:** Common testing patterns and utilities

### Generated Documentation (`/generated-docs/`)

- **API Documentation:** Generated from TypeScript using TypeDoc
- **Component Documentation:** Generated using Compodoc
- **JavaScript Documentation:** Generated using JSDoc
- **Architectural Diagrams:** Generated using PlantUML
- **Code Coverage Reports:** Generated using Vitest

## Documentation Rules

1. **Append-Only Strategy:**

   - Create new files rather than editing archived files
   - Keep historical documentation in `.archive` directory
   - Reference archived files when needed but don't modify them

2. **Focus on Synthesis:**

   - Provide high-level insights rather than code transcription
   - Explain the "why" behind implementation choices
   - Connect related concepts through cross-references

3. **Clear Organization:**

   - Use consistent file naming (kebab-case)
   - Maintain a logical directory structure
   - Keep related documentation together

4. **Cross-Referencing:**
   - Use relative paths for internal links
   - Don't include `.md` extensions in links
   - Link to related documentation where relevant

## Writing Guidelines

1. **Structure:**

   - Start with a clear overview
   - Use descriptive headings
   - Break content into logical sections
   - Include examples where helpful

2. **Content:**

   - Focus on essential information
   - Explain concepts clearly and concisely
   - Include rationale for important decisions
   - Provide context for implementation details

3. **Formatting:**

   - Use consistent Markdown formatting
   - Format code blocks with appropriate language tags
   - Use lists and tables for better readability
   - Include diagrams where they add value

4. **Maintenance:**
   - Keep documentation up-to-date with code changes
   - Review documentation regularly for accuracy
   - Archive outdated documentation
   - Update cross-references when files move

## Documentation Process

1. **Creating New Documentation:**

   - Create new files in appropriate directories
   - Follow the established structure and guidelines
   - Include necessary cross-references
   - Review for accuracy and completeness

2. **Updating Documentation:**

   - Create new files rather than editing archived ones
   - Update cross-references as needed
   - Follow the append-only strategy
   - Maintain the documentation hierarchy

3. **Archiving Documentation:**

   - Move outdated files to `.archive` directory
   - Update any references to archived files
   - Document the reason for archiving
   - Preserve historical context

4. **Generating Documentation:**
   - Use the documentation generation build step
   - Add JSDoc comments to code
   - Keep configuration files up-to-date
   - Review generated documentation for accuracy

## Tools and Resources

- **Markdown:** Primary format for documentation
- **Mermaid:** For diagrams and flowcharts
- **Cross-references:** For connecting related documentation
- **Directory Structure:** For organizing documentation logically
- **Documentation Generation:**
  - TypeDoc for TypeScript API documentation
  - JSDoc for JavaScript documentation
  - Compodoc for component documentation
  - PlantUML for architectural diagrams
  - Vitest for code coverage reports

## Best Practices

1. **Keep It Current:**

   - Update documentation with code changes
   - Archive outdated documentation
   - Review regularly for accuracy
   - Run documentation generation regularly

2. **Make It Findable:**

   - Use clear file names
   - Maintain logical structure
   - Add cross-references
   - Keep generated documentation organized

3. **Keep It Useful:**

   - Focus on practical information
   - Include examples
   - Explain rationale
   - Add comprehensive JSDoc comments

4. **Make It Clear:**
   - Use simple language
   - Break down complex topics
   - Include diagrams when helpful
   - Ensure generated documentation is well-structured
