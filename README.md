# Delivery System

A real-time delivery management application with separate dashboards for dispatchers, retailers, and riders.

## Features

- User registration and JWT-based authentication
- Role-based dashboards for dispatchers, retailers, and riders
- Delivery creation, assignment, editing, and status tracking
- Real-time updates through Socket.IO
- MongoDB persistence through Mongoose
- React UI built with Vite, Tailwind CSS, and reusable components

## Project structure

```text
delivery-system/
├── backend/      # Express API, authentication, MongoDB models, and Socket.IO
└── frontend/     # React/Vite client application
```

## Requirements

- Node.js 18 or newer
- pnpm 11
- MongoDB running locally or an accessible MongoDB instance

## Configuration

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/delivery_database
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Do not commit environment files or production secrets.

## Installation

Install dependencies in both applications:

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

## Development

Start the backend:

```bash
cd backend
pnpm dev
```

Start the frontend in a second terminal:

```bash
cd frontend
pnpm dev
```

The frontend is served by Vite, normally at `http://localhost:5173`. The API listens on the configured backend port, normally `http://localhost:5000`.

## Frontend commands

Run these from `frontend/`:

```bash
pnpm dev       # Start the Vite development server
pnpm build     # Create a production build
pnpm lint      # Run ESLint
pnpm preview   # Preview the production build
```

## Backend commands

Run these from `backend/`:

```bash
pnpm dev       # Start the API with nodemon
```

## Workflow

1. Register or log in.
2. Open the dashboard associated with the authenticated user's role.
3. Retailers create and manage deliveries.
4. Dispatchers assign deliveries to riders.
5. Riders view assigned deliveries and update their progress.
6. Socket.IO broadcasts relevant updates to connected dashboards.
