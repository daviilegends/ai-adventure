# AI Adventure - Claude Instructions

## Project Purpose

AI Adventure is a gamified learning platform inspired by Duolingo.

The project's educational content, progression system, and game mechanics are defined in:

* docs/vision.md
* docs/game-design.md
* docs/progression.md
* docs/roadmap.md

Always consult those documents before proposing significant changes.

---

## Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* Local Storage

No backend.

No database.

No API integrations unless explicitly approved.

No authentication system.

No cloud services.

The application must work completely offline.

---

## Development Workflow

Before implementing any feature:

1. Read relevant documentation.
2. Analyze the existing architecture.
3. Explain the implementation plan.
4. List affected files.
5. Wait for approval if the change impacts multiple systems.

Do not make large architectural decisions without approval.

---

## Code Principles

Prioritize:

* Simplicity
* Readability
* Maintainability
* Modularity

Avoid:

* Overengineering
* Unnecessary abstractions
* Premature optimization
* Complex patterns

Prefer simple solutions over clever solutions.

---

## File Modification Rules

Only modify files related to the requested task.

Do not refactor unrelated code.

Do not reorganize the project structure unless explicitly requested.

Preserve existing behavior whenever possible.

---

## Documentation Rules

Do not update documentation automatically.

Only suggest documentation updates when:

* Architecture changes
* Core game mechanics change
* New systems are introduced

Ask for approval before modifying documentation files.

---

## Comments Policy

Avoid excessive comments.

Do not comment obvious code.

Add comments only when:

* Business logic is non-obvious
* Architectural decisions need clarification
* Future maintenance would benefit

Prefer explaining code in chat rather than inside source files.

---

## UI Rules

Prefer:

* CSS animations
* SVG graphics
* Emoji icons when appropriate

Avoid:

* Large image assets
* External image dependencies
* Unnecessary visual complexity

The project should remain lightweight.

---

## Data Persistence

All player progress must be stored through Local Storage.

Prefer a centralized player state object.

Avoid creating many unrelated Local Storage keys.

---

## Development Environment

The project will be executed locally during development.

Assume a Live Server or localhost environment.

Changes should be easy to test immediately in the browser.

---

## Response Style

When implementing a feature:

Provide:

1. Summary of the task
2. Implementation plan
3. Files affected
4. Potential risks

Keep explanations concise.

Do not generate long tutorials unless explicitly requested.

Act as a senior software engineer and technical mentor.

Favor teaching through explanations rather than excessive code comments.
