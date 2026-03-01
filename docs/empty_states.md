# Empty States

Empty states follow a consistent pattern across the app.

## Guideline

- **Title:** Short, e.g. "No flows found", "No jobs yet".
- **Description:** One sentence explaining why the list is empty or what to do next.
- **Primary action:** One main button (e.g. "Sync from registry", "Go to Flows").
- **Secondary action (optional):** Outline button for an alternative (e.g. "Create flow").

Use the shared `EmptyState` component for all list empty states.

## By page

- **Flows:** Primary = "Sync from registry" (import flows from code or server files). Secondary = "Create flow" (wizard). Helper text: "Import flows created in code or loaded from server files."
- **Jobs:** "No jobs yet" + "Jobs will appear here when you run flows." + "Go to Flows".
- **Workers:** "No workers yet" + "Workers will appear here when you run flows." + "Go to Flows".
- **Home:** Same pattern for recent jobs: "No jobs yet" + "Start a job from the Flows page to see it here." + "Go to Flows".
