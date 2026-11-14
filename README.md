# Mart Task Planner

Mart Task Planner is a responsive React task board for organizing work into
groups, tracking status, and reviewing deadlines. It includes board, calendar,
and insights views, plus light and dark themes.

## Development

This project uses TypeScript, React, Vite, Tailwind CSS, Framer Motion, and
Lucide icons.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The generated files in `dist/` intentionally use readable `app.js` and
`index.css` names and retain line breaks to make local inspection easier.

## Project structure

- `src/App.tsx` - small application entrypoint
- `src/features/task-board/` - task board feature UI and its public export
- `src/controllers/useTaskBoard.ts` - task and group state management
- `src/models/task.ts` - shared task and group types
- `src/styles.css` - application styles
- `task-operation-demo.ts` - standalone TypeScript recursion and async demo

The feature folder keeps the task board implementation together while the
root entrypoint remains stable for `main.tsx` and future features.
