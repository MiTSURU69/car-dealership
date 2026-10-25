# AI Prompts Used During Development

This is a record of the requests and follow-up instructions I used while building the car dealership project. The prompts below capture the work and decisions discussed during development.

## Planning and architecture

1. **Project plan:** Help me break the car dealership kata into small, testable steps. Use Node.js, TypeScript, Express, SQLite, Prisma, React, and Jest. Identify the core backend, frontend, testing, and deployment tasks.
2. **Data and API design:** Suggest a vehicle and user data model, API routes for browsing and managing inventory, and a purchase flow that safely reduces stock. Explain the trade-offs before implementation.
3. **Authentication:** Help me implement registration, login, JWT authentication, and admin-only actions. Keep secrets in environment variables and explain how to test access control.

## Test-driven implementation

4. **Red phase:** For each feature, help me write focused tests first. I want to run the tests and see the expected failure before implementing the feature.
5. **Green phase:** Implement the smallest change that satisfies the failing tests, including request validation, services, controllers, and middleware. Explain any non-obvious code.
6. **Purchase safety:** Make the stock decrement atomic so simultaneous purchases cannot oversell a vehicle. Add tests for available, insufficient, and zero stock.
7. **Inventory features:** Add sorting and pagination to vehicle listings, then test their expected order and boundaries.
8. **Refactor and verification:** Review the implementation for duplication and run the complete test suite after changes. Check that Jest only discovers the intended TypeScript test files.

## Frontend and product decisions

9. **Customer interface:** Build a responsive vehicle browsing experience with clear vehicle details, registration and login, and a purchase action that reflects current stock.
10. **Visual direction:** Use distinctive typography, a deliberate color palette, layered backgrounds, and restrained staggered animation. Remove the pulsing logo dot.
11. **Scope:** Treat purchase as an inventory operation; do not add a payment gateway. Do not create a default demo customer account. Use appropriately sourced vehicle imagery.

## Debugging, deployment, and documentation

12. **Debugging:** Help me understand errors from Prisma, Node, TypeScript, Jest, and Render. Propose a specific fix for each error, then verify it with the relevant command or test.
13. **Deployment:** Help me deploy the API and static frontend to Render, configure environment variables and CORS, and test the live site from outside my local machine.
14. **README:** Document setup, environment variables, API routes, test results, screenshots, deployment links, and my use of AI. Check that links and screenshot filenames match the repository.
15. **Final review:** Check the repository for leftover TODOs, missing screenshots, accidentally committed `.env` or database files, failing tests, and broken live links before submission.

## How I used the output

I used the assistant for planning, code drafts, explanations, and debugging suggestions. I made project decisions, ran commands and tests, reviewed results, and corrected issues I found. 
