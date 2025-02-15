## instructions:

As an LLM developer processing this document:

1. Review the task list structure, which is organized in Epics > Stories > Tasks.

   - The tasks are located in a designated file [integration-test.todo](./integration-test.todo). This file describes a single Epic.

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
