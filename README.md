# Notion Reinvent

A full-stack Notion-style workspace app built with a Node.js/Express backend, MongoDB/Mongoose, and a React/Vite frontend.

This file is the project guide you can share with someone who needs to understand the codebase quickly. It covers the architecture, data model, API surface, frontend flow, setup, and the current implementation status.

## What The App Does

The app lets a user:

- register and log in
- create and manage workspaces
- create pages inside a workspace
- create, edit, delete, and reorder blocks inside a page
- request a password reset by email

The backend owns authentication, persistence, and authorization. The frontend owns routing, session state, and page rendering.

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB and Mongoose
- JWT for authentication
- bcryptjs for password hashing
- nodemailer for password reset emails
- zod for request validation
- express-async-handler for async error handling

Frontend:

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS 4

## Repository Layout

Backend:

- [backend/server.js](backend/server.js) boots the API server and registers routes
- [backend/config/db.js](backend/config/db.js) connects to MongoDB
- [backend/controllers](backend/controllers) contains request handlers
- [backend/models](backend/models) contains Mongoose schemas
- [backend/routers](backend/routers) maps endpoints to controllers
- [backend/middlewares](backend/middlewares) contains auth and error handling
- [backend/utils](backend/utils) contains helpers such as JWT and email sending

Frontend:

- [frontend/src/main.jsx](frontend/src/main.jsx) mounts the app and auth provider
- [frontend/src/App.jsx](frontend/src/App.jsx) defines routes
- [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) stores session state
- [frontend/src/api/axios.js](frontend/src/api/axios.js) configures the API client and token interceptor
- [frontend/src/pages](frontend/src/pages) contains page-level screens
- [frontend/src/components](frontend/src/components) contains shared UI helpers like protected routing

## Backend Architecture

The backend follows a simple MVC-style split:

- models define the database shape
- controllers implement business logic
- routers expose HTTP endpoints
- middleware verifies JWTs and centralizes errors

`server.js` loads environment variables, connects to MongoDB, enables JSON parsing, mounts the API routers, and starts the server.

## Data Model

User:

- `name`
- `email`
- `password`
- `resetPasswordToken`
- `resetPasswordExpire`
- `currentStreak`
- `lastActiveDate`

Workspace:

- `name`
- `owner` references `User`
- `pages` references `Page`

Page:

- `title`
- `workspace` references `Workspace`
- `blocks` references `Block`
- `createdBy` references `User`

Block:

- `type` can be `text`, `heading`, `todo`, or `image`
- `order` controls display order
- `page` references `Page`
- `content` stores the block text or payload

## API Surface

Base prefix:

- `/api/auth`
- `/api/workspaces`
- `/api/pages`
- `/api/blocks`

Auth:

- `POST /api/auth/register` creates a user and returns a token
- `POST /api/auth/login` validates credentials and returns a token
- `GET /api/auth/me` returns the current authenticated user
- `POST /api/auth/forgotpassword` creates a password-reset token and sends email
- `PUT /api/auth/resetpassword/:token` resets the password using the raw token

Workspaces:

- `GET /api/workspaces` returns the current user’s workspaces
- `POST /api/workspaces` creates a workspace for the current user
- `PUT /api/workspaces/:id` renames a workspace the user owns
- `DELETE /api/workspaces/:id` deletes a workspace the user owns

Pages:

- `GET /api/pages?workspaceId=...` returns the current user’s pages for a workspace
- `POST /api/pages` creates a page and attaches it to a workspace
- `GET /api/pages/:id` returns one page owned by the current user
- `PUT /api/pages/:id` updates the page title
- `DELETE /api/pages/:id` deletes a page and removes it from its workspace

Blocks:

- `GET /api/blocks/:pageId` returns ordered blocks for a page
- `POST /api/blocks/:pageId` creates a block in a page
- `PUT /api/blocks/:id` updates a block’s content and type
- `DELETE /api/blocks/:id` deletes a block and removes it from the page
- `PATCH /api/blocks/reorder/:pageId` reorders blocks inside a page

## Authentication Flow

1. The user submits email and password to the login endpoint.
2. The server looks up the user by email.
3. `bcryptjs` compares the supplied password with the stored hash.
4. If valid, the server signs a JWT with the user id.
5. The token is returned to the frontend.
6. The frontend stores the token and user in `localStorage` through `AuthContext`.
7. The Axios interceptor attaches `Authorization: Bearer <token>` to outgoing requests.
8. The backend `authMiddleware` verifies the token on protected routes.
9. If the token is invalid or expired, the frontend clears session state and sends the user back to `/login`.

## Password Reset Flow

1. The user submits an email to `forgotpassword`.
2. The backend generates a random reset token with `crypto.randomBytes`.
3. The hashed token and expiry timestamp are stored on the user document.
4. The raw token is emailed to the user.
5. The user submits a new password with the token in the URL.
6. The backend hashes the token again, validates expiry, updates the password, and clears the reset fields.

Important note:

- Password-reset emails use `FRONTEND_URL` when set, otherwise `http://localhost:5173`, and link to `/reset-password/:token` in the frontend.

## Frontend Flow

The frontend is already wired for protected navigation and session persistence:

- `AuthProvider` restores `user` and `token` from `localStorage`
- `ProtectedRoute` blocks protected pages until the user is authenticated
- `axios.js` injects the JWT into API requests automatically
- `App.jsx` routes `/`, `/login`, `/register`, `/dashboard`, and `/page/:id`

Current route behavior:

- `/` redirects to `/dashboard`
- `/login` renders the login screen
- `/register` renders the register screen
- `/dashboard` is protected
- `/page/:id` is protected

## Current Frontend Status

Implemented:

- auth context and session persistence
- protected routing
- axios token handling
- a basic login screen scaffold

Not yet implemented or still empty:

- dashboard page content
- register page content
- page editor content

That means the frontend structure is ready, but the user-facing workspace UI is still in progress.

## Setup

Backend environment variables in `backend/.env`:

```env
CONNECTION_STRING=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Frontend environment variables in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Install and run:

```bash
cd backend
npm install
npm start
```

```bash
cd frontend
npm install
npm run dev
```

## Development Notes

- The backend currently uses `nodemon` through `npm start`.
- The frontend stores auth state in `localStorage`, so refreshes keep the user logged in.
- Workspace, page, and block ownership checks are enforced on the backend, not just in the UI.
- Blocks are stored separately from pages and sorted by the `order` field.
- The current codebase contains several work-in-progress pages on the frontend, so the backend is ahead of the UI.

## Suggested Next Improvements

1. Implement the dashboard page to list workspaces and pages.
2. Implement the register page and connect it to the auth API.
3. Build the page editor UI for creating, editing, and reordering blocks.
4. Move repeated API calls into a small frontend service layer.
5. Configure `FRONTEND_URL` for the deployed frontend before enabling password-reset emails.

## Summary

This project is a Notion-style app with token-based auth, workspace/page/block ownership, password reset via email, and a React frontend scaffold ready for the next UI layer. If someone reads this README, they should understand what the app is, how the data flows, how the API is organized, and what is already built versus what is still pending.
