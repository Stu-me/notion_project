# Notion Clone

A full-stack Notion-style app with workspaces, pages, and blocks. This README is a cleaner version of the notes I used while building the project, keeping the same ideas but organized for quick scanning.

## Project Overview

### Backend Flow (MVC)

- MongoDB + Mongoose for data and relationships.
- Models: user, workspace, page, block.
- Relationships use `ref` + `populate` to connect data.

Model roles:

- User: stores account data.
- Workspace: holds project name and pages.
- Page: holds blocks.
- Block: stores the content on a page.

## API Endpoints

### Auth

- POST /api/auth/register - create new user
- POST /api/auth/login - login, returns JWT token
- GET /api/auth/me - get logged in user info (protected)
- POST /api/auth/forgotpassword - request reset token
- PUT /api/auth/resetpassword/:token - reset password using token

### Workspaces

- GET /api/workspaces - get all workspaces of the user
- POST /api/workspaces - create a workspace
- PUT /api/workspaces/:id - rename a workspace
- DELETE /api/workspaces/:id - delete a workspace

### Pages

- GET /api/pages - get all pages in a workspace
- POST /api/pages - create a new page
- GET /api/pages/:id - get a single page with its blocks
- PUT /api/pages/:id - update page title or metadata
- DELETE /api/pages/:id - delete a page

### Blocks

- GET /api/blocks/:pageId - get all blocks of a page
- POST /api/blocks/:pageId - add a block to a page
- PUT /api/blocks/:id - edit a block's content
- DELETE /api/blocks/:id - delete a block
- PATCH /api/blocks/reorder - reorder blocks (drag and drop)

## Auth Flow

1. User sends email + password to POST /api/auth/login.
2. Server finds user by email in database.
3. Server uses bcryptjs to compare incoming password with stored hash.
4. If match, server creates a JWT containing the userId.
5. JWT is sent back to the frontend.
6. Frontend stores JWT (memory or httpOnly cookie).
7. Every subsequent request sends JWT in the Authorization header.
8. Server verifies JWT on every protected route.
9. If valid, request goes through.
10. If invalid or expired, 401 Unauthorized.

Why bcryptjs over bcrypt?

- bcrypt includes native C++ bindings that can cause deployment issues.
- bcryptjs is pure JS and easier to deploy reliably.

## Forgot Password Flow

1. User clicks "Forgot Password" and enters email.
2. Backend generates a secure random token.
3. Stores the hashed token with an expiry (usually 10-15 minutes).
4. Sends a reset link containing the raw token.
5. User opens link and submits new password.
6. Backend hashes token, validates expiry, updates password.
7. Clears reset token fields.

Flow summary:

- Forgot password: request -> token generated -> stored (hashed)
- Reset password: token sent -> hashed -> matched -> password updated

## Email (Nodemailer)

- Used to send reset password emails.
- SMTP details are read from env vars.

## Frontend Notes

- Direct axios calls inside components for simplicity while learning.
- V2 plan: move API calls into a service layer as the team grows.

Login page flow:

1. Show a form with email and password fields.
2. User submits form.
3. POST /api/auth/login with credentials.
4. On success, call `login()` from `AuthContext` and redirect to /dashboard.
5. On failure, show error message.

## Tech Stack

### Backend

- Node.js, Express
- MongoDB, Mongoose
- JWT auth, bcryptjs
- Nodemailer
- Zod for validation

### Frontend

- React + Vite
- React Router
- Tailwind CSS
- Axios

## Environment Variables

Create a `.env` file inside `backend/`:

```
CONNECTION_STRING=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
PORT=5000
```

## Getting Started

### Backend

```
cd backend
npm install
npm start
```

### Frontend

```
cd frontend
npm install
npm run dev
```

## Controllers Implemented

- Workspaces: `getWorkspaces`, `createWorkspaces`, `updateWorkspaces`, `deleteWorkspaces`
- Pages and blocks follow the same controller pattern