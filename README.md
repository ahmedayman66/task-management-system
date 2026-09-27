# TaskFlow — Collaborative Task Management System

A full-stack, responsive Task Management System inspired by Trello, designed for organizing projects, workflows, and team tasks with real-time status management and Kanban board capabilities.

---

## 1. Project Overview

TaskFlow is a modern project and task management application. Authenticated users can create and configure project boards, invite team members, organize work into customizable lists, and manage tasks with priority levels, due dates, statuses, and member assignments.

---

## 2. Features

- **Authentication & Security:**
  - Secure user registration and login with bcrypt password hashing.
  - Stateless JWT-based authentication with token verification middleware.
  - Protected API routes and client-side route guards.
  - Helmet security headers, CORS origin protection, and brute-force rate limiting on auth endpoints.

- **Board Management:**
  - Create, view, update, and delete project boards.
  - Automatic board ownership and membership handling.
  - Team collaboration: add members by email and remove members (owner-only).
  - Cascading deletion: deleting a board cleans up its lists and tasks without orphaned records.

- **List Management:**
  - Create customizable lists inside boards (e.g., *To Do*, *In Progress*, *Review*, *Done*).
  - Inline list title renaming.
  - Delete lists with cascading removal of contained tasks.

- **Task Management:**
  - Create and edit tasks with title, description, priority (`low`, `medium`, `high`), due date, and assigned member.
  - Quick status updates (`todo`, `in_progress`, `done`).
  - Move tasks seamlessly between lists on the same board.
  - Assignee validation: tasks can only be assigned to valid members of the parent board.
  - Overdue date indicators and visual hierarchy.

- **Filtering & Pagination:**
  - Search tasks by title or description keyword.
  - Filter tasks by status, priority, and assigned member.
  - Server-side task pagination with metadata (`page`, `limit`, `total`, `totalPages`).

- **User Experience & UI:**
  - Clean, responsive dark-mode Kanban UI.
  - Loading indicators, confirmation dialogs for destructive actions, and clear empty states.

---

## 3. Tech Stack

- **Backend:**
  - Node.js & Express.js (RESTful API architecture)
  - MongoDB & Mongoose (ODM with validation, hooks, and indexes)
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for secure password hashing
  - express-validator for robust request body and query validation
  - helmet, cors, and express-rate-limit for security
  - morgan for HTTP logging

- **Frontend:**
  - React 18
  - Vite
  - React Router DOM v6
  - Axios for centralized API requests and interceptors
  - Lucide React for consistent icons
  - Vanilla CSS design system with custom tokens and animations

---

## 4. Project Structure

```text
task-management-system/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── api/                # API client and endpoint service abstractions
│   │   │   ├── client.js
│   │   │   ├── authApi.js
│   │   │   ├── boardApi.js
│   │   │   ├── listApi.js
│   │   │   └── taskApi.js
│   │   ├── components/         # Reusable UI components (Modals, Cards, Alerts, etc.)
│   │   ├── context/            # AuthContext provider and state
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── pages/              # Views (Login, Register, Dashboard, BoardView, NotFound)
│   │   ├── routes/             # ProtectedRoute wrapper
│   │   ├── App.jsx             # Router configuration
│   │   ├── index.css           # Global design system
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # Database connection (Mongoose)
│   │   ├── controllers/        # Route controllers (auth, board, list, task)
│   │   ├── middleware/         # Auth, validation, and centralized error handling
│   │   ├── models/             # Mongoose schemas (User, Board, List, Task)
│   │   ├── routes/             # Express route declarations
│   │   ├── validators/         # express-validator schemas
│   │   ├── utils/              # ApiResponse and AppError helpers
│   │   ├── app.js              # Express app setup and middleware configuration
│   │   └── server.js           # Server entry point and database connection
│   ├── tests/                  # Automated integration tests (Jest & Supertest)
│   ├── .env.example
│   └── package.json
│
├── postman/                    # API test collection
│   └── Task-Management-System.postman_collection.json
│
├── package.json                # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## 5. System Requirements

- **Node.js**: `v18.x` or higher (tested on Node `v22.17.1`)
- **NPM**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

---

## 6. Installation & Setup

### Clone and Install Dependencies

From the project root:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

Or using root monorepo scripts:

```bash
npm run install:all
```

---

## 7. Environment Variables

Create `.env` inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management
JWT_SECRET=super_secret_jwt_key_task_management_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

A template is provided in `server/.env.example`.

---

## 8. Running the Application

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

The backend server starts on `http://localhost:5000`.

### 2. Start the Frontend Client

```bash
cd client
npm run dev
```

The frontend client starts on `http://localhost:5173`.

---

## 9. API Documentation

### Base URL: `/api`

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Boards (`/api/boards`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/boards` | Create a new board (creator is owner) | Private |
| `GET` | `/api/boards` | Get all boards current user is a member of | Private |
| `GET` | `/api/boards/:boardId` | Get single board by ID | Private (Member) |
| `PATCH` | `/api/boards/:boardId` | Update board title and description | Private (Owner) |
| `DELETE` | `/api/boards/:boardId` | Delete board and cascade delete lists & tasks | Private (Owner) |
| `POST` | `/api/boards/:boardId/members` | Invite new member to board | Private (Member) |
| `DELETE` | `/api/boards/:boardId/members/:userId` | Remove member from board | Private (Owner) |

### Lists (`/api/boards/:boardId/lists` & `/api/lists/:listId`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/boards/:boardId/lists` | Create a new list on a board | Private (Member) |
| `GET` | `/api/boards/:boardId/lists` | Retrieve all lists for a board | Private (Member) |
| `PATCH` | `/api/lists/:listId` | Rename list or update position | Private (Member) |
| `DELETE` | `/api/lists/:listId` | Delete list and cascade delete tasks | Private (Member) |

### Tasks (`/api/tasks` & `/api/lists/:listId/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/lists/:listId/tasks` | Create a task in a specific list | Private (Member) |
| `GET` | `/api/lists/:listId/tasks` | Get all tasks belonging to a list | Private (Member) |
| `GET` | `/api/tasks` | Filter and paginate tasks (`status`, `priority`, `page`, `limit`) | Private |
| `GET` | `/api/tasks/:taskId` | Get task details | Private (Member) |
| `PATCH` | `/api/tasks/:taskId` | Update task fields (title, priority, list, etc.) | Private (Member) |
| `PATCH` | `/api/tasks/:taskId/status` | Dedicated status update (`todo`, `in_progress`, `done`) | Private (Member) |
| `PATCH` | `/api/tasks/:taskId/assign` | Dedicated task assignment to board member | Private (Member) |
| `DELETE` | `/api/tasks/:taskId` | Delete a task | Private (Member) |

---

## 10. Automated Testing

Integration tests verify all core flows (Auth, Boards, Lists, Tasks, Filtering, Pagination, Authorization):

```bash
cd server
npm test
```

Test results: **25 passed, 0 failed**.

---

## 11. Postman Collection

Import the included collection into Postman:

- File: `postman/Task-Management-System.postman_collection.json`
- Variables pre-configured: `baseUrl`, `token`, `boardId`, `listId`, `taskId`, `userId`.
- Tests automatically update `token`, `boardId`, `listId`, and `taskId` across requests.

---

## 12. Future Enhancements

- Real-time updates via WebSockets / Socket.io.
- Drag-and-drop column and card reordering via HTML5 Drag and Drop or `@hello-pangea/dnd`.
- Task comments and activity audit timeline.
- File and attachment uploads.
