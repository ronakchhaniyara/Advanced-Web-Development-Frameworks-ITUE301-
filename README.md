# Student Portfolio

This project is a Vite + React student portfolio built to satisfy two practicals:

- Practical 1: reusable component architecture using `Header`, `About`, `Skills`, and `Footer`
- Practical 2: routing and state management using React Router and `useState`

## Features

- Home route that composes reusable portfolio components
- Projects route that now displays GitHub repositories from a public API
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

Open `http://localhost:5173/` after starting the Vite development server.

## Practical 3: API Integration

Practical 3 extends the existing `/projects` route by consuming the GitHub REST API with the native React Fetch API flow.

- Uses `fetch()` to request public repositories from `https://api.github.com/users/octocat/repos`
- Uses `useEffect(..., [])` to fetch repositories when the `Projects` component mounts
- Uses `useState` to manage repository data, loading state, error state, and the repository search input
- Shows a loading indicator while the API request is in progress
- Shows an error message with Retry functionality if the request fails
- Renders repository name, repository link, and star count after a successful response
- Filters repositories locally with a search input without making extra API calls
- Handles empty API results and empty search results safely

No API key or authentication is required because this practical uses GitHub's public repositories endpoint.

## Practical checklist

- React app scaffolded with Vite
- Components stored in `src/components`
- Props used in multiple components
- `BrowserRouter` configured in `src/main.jsx`
- `Routes` and `Route` configured in `src/App.jsx`
- `useState` used for theme toggle, help visibility, and controlled input
- `fetch()` + GitHub REST API integrated into `src/components/Projects.jsx`
- Loading, error, retry, and search states added for Practical 3
