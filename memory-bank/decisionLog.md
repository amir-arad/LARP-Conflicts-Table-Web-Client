## 2025-02-28 - Update Memory Bank (UMB) - New Documentation Rules

**Context:** User provided new rules for documentation updates: 1) Do not edit files in `.archive` folder, 2) Do not transcribe code, focus on synthesis and high-level insights. User also requested another UMB operation.

**Decision:** Update Memory Bank files to reflect the new documentation rules and adjust documentation approach to focus on synthesis and high-level insights, avoiding code transcription and archive edits.

**Rationale:** To comply with user's new instructions and ensure Memory Bank reflects the updated documentation strategy.

**Implementation:**

1.  **Update `memory-bank/activeContext.md`**: Clear current session context and add notes about new documentation rules and UMB operation (second iteration).
2.  **Update `memory-bank/progress.md`**: Add new entries for work done in this session, including updating documentation approach and performing UMB operation again.
3.  **Create this entry in `decisionLog.md`**: Document the new documentation rules and the adjustment in documentation approach.

**Confirmation:** Memory Bank files (`memory-bank/activeContext.md`, `memory-bank/progress.md`, `memory-bank/decisionLog.md`) updated to reflect new documentation rules and current task status (second iteration of UMB).

## 2025-02-28 - Documentation Reorganization - Third Iteration

**Context:** Need to reorganize documentation to improve knowledge management and discoverability, following the new documentation rules focusing on synthesis and high-level insights.

**Decision:** Create a hierarchical documentation structure with separate files for features, user flows, components, and integrations, with cross-references between related documents.

**Rationale:**

- Clear separation of concerns makes documentation easier to navigate
- Feature-specific files provide focused, detailed information
- User flow documentation helps understand the application from a user's perspective
- Component documentation aids developers in understanding the codebase
- Integration documentation details external service interactions
- Cross-references help users find related information

**Implementation:**

1. Create feature documentation files:
   - `docs/product/features/authentication.md`
   - `docs/product/features/conflicts-table.md`
   - `docs/product/features/real-time-collaboration.md`
   - `docs/product/features/internationalization.md`
2. Create user flow documentation:
   - `docs/product/ux/authentication-flow.md`
   - `docs/product/ux/table-interaction.md`
3. Create component documentation:
   - `docs/architecture/components/conflicts-table-tool.md`
   - `docs/architecture/components/auth-context.md`
   - `docs/architecture/components/firebase-context.md`
   - `docs/architecture/components/google-sheets-context.md`
   - `docs/architecture/components/language-context.md`
4. Create integration documentation:
   - `docs/architecture/firebase-integration.md`
   - `docs/architecture/google-sheets-integration.md`
5. Add cross-references between related documents
6. Review all documentation for accuracy, clarity, and completeness

**Confirmation:** Documentation reorganization completed with all planned files created and cross-referenced.
