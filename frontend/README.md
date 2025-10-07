# Foodie Haven (MERN MVP)

A full-stack refactor of the legacy vanilla JS Foodie Haven into a MERN app with JWT auth, Tailwind styling, MealDB integration, user-posted recipes, filtering, theme toggle, and server-side favorites.

## Tech Stack
- Backend: Node, Express, MongoDB (Mongoose), JWT, bcryptjs, CORS, dotenv
- Frontend: React (Vite), React Hooks, Context API, Tailwind CSS, Axios, react-router-dom (future routing)
- External API: TheMealDB

## Monorepo Structure
```
food-website/
  backend/
    models/
    routes/
    middleware/
    server.js
    package.json
    .env (you create)
  frontend/
    src/
      components/
      context/
    index.html
    vite.config.js
    package.json
README.md
```

## Features
- JWT Authentication (Register/Login)
- Post Recipe (authenticated)
- Recipe aggregation: MealDB + user recipes
- Filters: All, User, Website (MealDB)
- Theme toggle with `dark-theme` (local persistence)
- Favorites: server-persisted per user (MealDB items or user recipes)
- Consistent legacy aesthetic (primary `#ff4500`, accent `#ffc107`, Montserrat font)

## Prerequisites
- Node 18+
- MongoDB Atlas (or any MongoDB connection string)

## Backend Setup
1) Create `backend/.env`
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

2) Install & run
```powershell
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:5000`.

### Backend Scripts
- `npm run dev`: start with nodemon
- `npm start`: start in production mode

### API Overview
Base URL: `http://localhost:5000/api`

Auth
- POST `/auth/register` { username, password }
- POST `/auth/login` { username, password } → { token, user }
  - Send JWT on protected routes via `x-auth-token` header

Recipes
- POST `/recipes` (auth): create user recipe
  - Body: { strMeal, strMealThumb, strCategory, strInstructions, ingredients[] }
- GET `/recipes` (public): list user recipes
  - Optional: `?postedBy=<userId>`

Favorites (auth)
- GET `/favorites`: list current user favorites
- POST `/favorites`: add favorite
  - MealDB: { type: "MealDB", mealId, snapshot? }
  - User recipe: { type: "User", recipeId }
- DELETE `/favorites/:id`: remove favorite by id
- POST `/favorites/toggle`: convenience toggle

## Frontend Setup
1) Install & run
```powershell
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173` by default.

### Dev Proxy
`frontend/vite.config.js` proxies `/api` to `http://localhost:5000` so axios can call relative paths like `/api/auth/login`.

### Tailwind
- Tailwind v4 import is configured in `src/index.css` via `@import "tailwindcss";`
- Custom colors (primary/accent) are defined in `tailwind.config.js`

## How to Use
1) Register then Login.
2) Post Recipe (button appears when logged in).
3) Search using the top bar:
   - Categories (e.g., `dessert`): uses MealDB filter endpoint
   - Keywords (e.g., `pizza`): uses MealDB search endpoint
4) Filter with buttons: All, User, Website.
5) Click a card → View Details; ingredients, instructions, and video (for MealDB).
6) Favorites: star button toggles server-persisted favorites; header Favorites button filters view.
7) Theme toggle (🌙/☀️) persists locally using `dark-theme` class.

## Important Files
- Backend
  - `server.js`: Express app, Mongo connect, mounts routes
  - `models/User.js`, `models/Recipe.js`, `models/Favorite.js`
  - `routes/auth.js`, `routes/recipes.js`, `routes/favorites.js`
  - `middleware/auth.js`: JWT verification (reads `x-auth-token`)
- Frontend
  - `src/context/AuthContext.jsx`: auth state, token in axios
  - `src/context/ThemeContext.jsx`: theme toggle + persistence
  - `src/context/FavoritesContext.jsx`: favorites from API
  - `src/components/Header.jsx`: theme, login/logout, favorites, post
  - `src/components/SearchBar.jsx`: legacy search behavior
  - `src/components/RecipeList.jsx`: merges MealDB + user recipes, filters, favorites, details
  - `src/components/RecipeDetailsModal.jsx`: details modal
  - `src/components/PostRecipeModal.jsx`: post recipe form

## Environment Notes
- Images: currently URL-based. For future uploads, add storage (Cloudinary/S3) and extend `Recipe` model and POST route to handle files.
- Security: keep `JWT_SECRET` private and rotate when necessary.

## Troubleshooting
- 401 on protected routes: ensure JWT is set in `AuthContext` and your login succeeded; verify `x-auth-token` header.
- CORS issues: backend uses `cors()` with defaults; adjust if serving from different origins.
- MealDB empty results: try another query or category; API can be rate-limited.

## License
MIT
