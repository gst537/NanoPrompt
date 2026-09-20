# Hidden Feature Toggles

When a project's UI reaches a point of high complexity or a specified limit (e.g., "20% limit"), and there is a need to add experimental, beta, or administrative features without cluttering the user interface:

1. **Access Method**: Implement a hidden settings modal triggered by a keyboard shortcut that works across OS platforms (e.g., `Cmd+Shift+H` for Mac, `Ctrl+Shift+H` for Windows/Linux). Do not add visible buttons for this modal unless explicitly asked.
2. **State Management**: Use `localStorage` combined with React Context (or the framework's equivalent global state) to persist feature toggle preferences across sessions.
3. **Implementation**: Conditionally render UI elements (like Navigation links, modes, or advanced tools) based on the globally accessible toggle states.
