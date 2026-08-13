# Practical 3: API Integration and Data Rendering in React

## Objective

To consume a REST API in React and handle asynchronous data with
loading and error states.

---

## Problem Statement

Integrate a public REST API into the existing React portfolio
application and render repository data dynamically on the Projects page.

The application should:

- Fetch repository data from the GitHub API
- Display a loading spinner while data is being fetched
- Display an error message if the API request fails
- Render at least the repository name and repository URL

---

## Technologies Used

- React
- Vite
- JavaScript
- HTML
- CSS
- Node.js
- npm
- Visual Studio Code
- Fetch API
- GitHub REST API

---

## Concepts Covered

- REST API Integration
- `fetch()`
- `useEffect`
- `useState`
- Asynchronous Data Handling
- Loading State
- Error State
- Conditional Rendering
- Data Rendering
- Retry Handling
- Search Filtering

---

## New Features Added

### 1. API Fetching in Projects Page

The `Projects.jsx` component fetches public repositories from the
GitHub API when the component mounts.

API used:

```text
https://api.github.com/users/octocat/repos
```

---

### 2. Loading State

A reusable `Spinner` component is displayed while the API request is in
progress.

---

### 3. Error State

A reusable `ErrorMessage` component is displayed if the API request
fails.

It also includes a Retry button to trigger the request again.

---

### 4. Repository Data Rendering

Fetched repositories are rendered using a reusable `RepoList`
component.

Each repository displays:

- Repository name
- Repository URL
- Star count

---

### 5. Search Filter

A search input is added to filter repositories by name without making
additional API calls.

---

## Project Structure

```text
src/
|
+-- components/
|   +-- Projects.jsx
|   +-- Spinner.jsx
|   +-- ErrorMessage.jsx
|   +-- RepoList.jsx
|
+-- App.jsx
+-- main.jsx
```

---

## State Variables Used

Inside `Projects.jsx`, the following state variables are used:

- `repos` to store fetched repository data
- `loading` to track whether the request is in progress
- `error` to store any request error message
- `searchTerm` to store the repository search input

---

## React Hooks Used

- `useEffect()` to trigger the API call when the component mounts
- `useState()` to manage repositories, loading, error, and search input

---

## Output

The Projects page now:

- Fetches repository data dynamically from GitHub
- Shows a loading spinner while waiting for the response
- Shows an error message with retry support on failure
- Renders repository cards on successful fetch
- Filters repositories through a search input

---

## Learning Outcome

Students will be able to consume a REST API in React, manage
asynchronous state properly, and render fetched data with suitable UI
feedback for loading, success, and error conditions.
