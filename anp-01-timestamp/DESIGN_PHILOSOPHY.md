# Design Philosophy - Timestamp Plugin

## Goal
To provide the definitive "Swiss Army Knife" for date and time in Amplenote, balancing extreme customization with frictionless standard defaults.

## Core Ideologies

### 1. Standard over Custom
Whenever possible, we align with industry standards.
- **Why?**: Users shouldn't have to learn a proprietary "Timestamp Language". By using Moment.js/Day.js tokens, we empower users with skills they likely already have or can easily look up.

### 2. Reliability through Mitigation
The transition to Day.js introduced a "Token Clash" bug (where `DDD` was misinterpreted).
- **Philosophy**: We don't accept library bugs as "limitations". If the library fails to parse correctly, we implement a robust mitigation layer (Pre-pass processing) to ensure the user gets exactly what they requested, regardless of underlying implementation quirks.

### 3. Visual Information Density
The Analog clock isn't just an image; it carries its own metadata. By embedding the original SVG source into the URL, we maintain a bridge between the "rendered" image and the "source" data.

### 4. Modular Growth
The folder structure (`lib/formatters`) ensures that adding a new type (e.g., "Binary Time" or "Star Date") is just a matter of adding a single file, keeping the entry point clean and maintainable.

### 5. Human-Centric Features
Calculated "Natural Text" timestamps represent our belief that tools should adapt to how people speak, not just how computers count.
