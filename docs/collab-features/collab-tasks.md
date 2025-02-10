# Real-Time Collaboration Process

## instructions:

As an LLM assistant processing this document:

1. Review the task list structure, which is organized in Epics > Stories > Tasks.

   - The tasks are located in a designated file [collab-tasks.todo](./collab-tasks.todo)

2. Task Scanning Protocol:

   - Scan tasks sequentially within each Story
   - Stories must be completed in order within their Epic
   - Epics must be completed in numerical order
   - Look for the first unchecked task (- [ ]) in the earliest incomplete Story

3. Before executing a task:

   - Verify all dependencies are met by checking the Dependencies section
   - Confirm previous tasks in the current Story are complete
   - Review any referenced documents mentioned in the References section
   - Check the Implementation Notes for specific ordering requirements

4. During task execution:

   - Follow standard code quality and testing requirements
   - Ensure changes align with the referenced UX and design documents
   - Create or modify files according to the specified paths
   - Implement only what is necessary for the current task

5. After completing a task:

   - Update this file by changing the task's checkbox from [ ] to [x]
   - Commit the task's code changes along with the updated task list
   - Verify the changes match the requirements in referenced documents

6. Error Handling:
   - If a task's prerequisites are not met, report this and do not proceed
   - If a task requires clarification, request it before proceeding
   - If unable to complete a task, explain why and what's needed

## Implementation Notes

### Suggested Implementation Order

1. Complete Epic 1 fully before moving to features
2. Stories 2.1 and 2.2 can be worked on in parallel
3. UI stories can start once corresponding feature is complete
4. Performance optimization should be ongoing

### Dependencies

- Epic 1 must be completed before starting Epic 2
- Each UI story depends on its corresponding feature story
- Performance optimization requires features to be implemented

### Testing Strategy

- Unit tests with each feature
- Integration tests for UI components
- End-to-end tests for critical flows
- Performance testing as features complete

### Rollout Strategy

1. Deploy infrastructure changes
2. Release presence features
3. Add locking mechanism
4. Enable cursor tracking
5. Progressive UI enhancement

## References

- [collab-tasks.todo](./collab-tasks.todo) - tasks management file
- [COLLABORATION-UX.md](./COLLABORATION-UX.md) - UX requirements
- [REALTIME-DESIGN.md](./REALTIME-DESIGN.md) - technical implementation design
