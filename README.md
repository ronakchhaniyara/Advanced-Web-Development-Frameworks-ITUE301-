# Student Portfolio

This project is a Vite + React student portfolio built to satisfy two practicals:

- Practical 1: reusable component architecture using `Header`, `About`, `Skills`, and `Footer`
- Practical 2: routing and state management using React Router and `useState`

## Features

- Home route that composes reusable portfolio components
- Projects route that displays a project list
- Contact route with a controlled input and live character count
- Active navigation using React Router links without full page reload
- Dark/light mode toggle using React state
- Custom 404 route for unknown paths

## Routes

- `/` - Home
- `/projects` - Projects
- `/contact` - Contact
- `*` - Not Found

## Run the project

```bash
npm install
npm run dev
```

## Practical checklist

- React app scaffolded with Vite
- Components stored in `src/components`
- Props used in multiple components
- `BrowserRouter` configured in `src/main.jsx`
- `Routes` and `Route` configured in `src/App.jsx`
- `useState` used for theme toggle, help visibility, and controlled input
