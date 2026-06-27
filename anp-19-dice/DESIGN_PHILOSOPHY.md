# Design Philosophy - Dice Roller Plugin

## Goal
To build the most comprehensive, robust, and performant gaming and selection utility inside Amplenote—bringing tabletop RPG tools, custom math parsers, and random table selection into one cohesive plugin note.

---

## Core Ideologies

### 1. Offline & Sync Resilience (Critical Pattern)
Tabletop campaigns and note-taking are frequently done offline or on unstable networks. 
- **Philosophy**: Storing temporary `local-` UUIDs in settings must be avoided because it leads to navigation failures and duplicate note creation once the client syncs online.
- **Implementation**: The `getNoteUUID` resolution layer ensures that the plugin dynamically swaps temporary identifiers for synced online ones, maintaining absolute resilience regardless of network state.

### 2. Sandbox Safety & IIFE Isolation
Since Amplenote executes plugins inside an `eval()` context, there is a risk of global variable namespace collisions.
- **Philosophy**: The bundle uses a strict IIFE wrapper enclosing helper variables. This ensures functions like mathematical parsers or specialized dice hand analyzers don't pollute the window namespace.

### 3. Polish & User Intent Affirmation
We believe user experience is in the details.
- **Philosophy**: Destructive commands (like clearing the audit trail) must require explicit keyword verification (`"YES"` confirmation) to avoid accidental loss. Helpful shortcuts (like viewing roll history) should verify that the target note has data before navigating, saving the user from blank screens.

### 4. Modular Separation of Concerns
Each gaming system or rolling method has unique math and structures.
- **Philosophy**: Keep Fudge rolling separate from Stunt rolling, and keep both isolated from the math parser. If one game mechanic requires changes, it should happen in its own file without any regression risk to other modules.
