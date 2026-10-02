# TaskFlow — Collaborative Task Management System
## نظام إدارة المهام والمشاريع التعاوني

A full-stack, responsive, bilingual Task Management System inspired by Trello, designed for organizing projects, workflows, and team collaboration with real-time status management and Kanban board capabilities.

---

## 1. Project Overview / نظرة عامة على المشروع

**TaskFlow** is a modern project and task management application supporting both **Arabic (العربية)** and **English** with seamless **RTL/LTR** bidirectional switching and **Light/Dark** themes. 

Authenticated users can create and configure project boards, invite team members, organize work into customizable lists, and manage tasks with priority levels, due dates, statuses, and member assignments.

The application follows a **Human Professional Design System** (avoiding generic purple AI SaaS templates), with tailored typography (**Cairo** for Arabic, **Inter** for Latin), accessible color contrast, and centralized CSS design tokens.

---

## 2. Features / المميزات المكتملة

- **Internationalization (i18n) & Bidirectional Layout (RTL / LTR):**
  - **Arabic by Default:** Initial language defaults to Arabic with native RTL layout (`dir="rtl"`, `lang="ar"`).
  - **Seamless Switching:** Toggle between Arabic and English dynamically with zero page reloads.
  - **100% Translated UI:** Navigation, forms, placeholders, validation alerts, empty states, modals, status tags, and priority badges. Zero untranslated strings.
  - **Language Persistence:** Preserved across sessions via `localStorage`.

- **Theme System (Light & Dark Mode):**
  - **No Purple AI Aesthetics:** Thoughtfully designed human color palette utilizing neutral slates, subtle surfaces, charcoal typography, and classic blue accents (`#2563eb`).
  - **True Dark Mode:** Layered slate surfaces with readable text and natural borders—never harsh pure-black or inverted colors.
  - **Clean Light Mode:** Crisp cards, subtle elevation, and comfortable contrast.
  - **Theme Persistence:** Stored in `localStorage` and applied through `<html data-theme="...">`.

- **Authentication & Security:**
  - Secure user registration and login with `bcryptjs` password hashing (salt rounds: 10).
  - Stateless JWT authentication with token verification middleware.
  - Protected API routes and client-side React router guards.
  - Helmet security headers, CORS origin enforcement, and brute-force rate limiting on auth endpoints.
  - Never leaks user passwords in API responses.

- **Board Management:**
  - Create, view, update, and delete project boards.
  - Automatic board ownership and membership handling.
  - Team collaboration: add members by email and remove members (owner-only permission).
  - Cascading deletion: deleting a board cleans up its lists and tasks without orphaned records.

- **List Management:**
  - Create customizable lists inside boards (e.g., *To Do*, *In Progress*, *Done*).
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
  - Server-side task pagination with metadata (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`).

- **User Experience & Accessibility:**
  - Fully responsive across Desktop, Tablet, and Mobile devices.
  - Semantic HTML5, accessible form labels, keyboard navigation, and explicit `aria-label` tags.
  - Empty states, loading spinners, and confirm dialogs for destructive operations.

---

## 3. Tech Stack / التقنيات المستخدمة

- **Backend:**
  - **Node.js** & **Express.js** (RESTful API architecture)
  - **MongoDB** & **Mongoose** (ODM with schema validations, pre/post hooks, and indexes)
  - **JSON Web Tokens (JWT)** for stateless authentication
  - **bcryptjs** for secure password hashing
  - **express-validator** for request body and query validation
  - **helmet**, **cors**, and **express-rate-limit** for API security
  - **morgan** for HTTP logging
  - **Jest** & **Supertest** for comprehensive API integration tests

- **Frontend:**
  - **React 18** (Functional components with Hooks and Context API)
  - **Vite 6** (Blazing-fast build tool and dev server)
  - **React Router DOM v6** (Client-side routing and protected routes)
  - **Axios** (Configured HTTP client with automatic bearer token injection and 401 interception)
  - **Lucide React** (Clean, accessible SVG icon library)
  - **Custom CSS Design Tokens** (Vanilla CSS variables, logical properties, themes, RTL styles)

---

## 4. Project Directory Structure / هيكل المشروع

```text
task-management-system/
├── frontend/                             # Frontend React Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── api/                          # Centralized Axios API services
│   │   │   ├── authApi.js
│   │   │   ├── boardApi.js
│   │   │   ├── client.js
│   │   │   ├── listApi.js
│   │   │   └── taskApi.js
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── Alert.jsx
│   │   │   ├── BoardMembersModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ListColumn.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── context/                      # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                        # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── i18n/                         # Internationalization
│   │   │   ├── ar.js                     # Arabic translations dictionary
│   │   │   ├── en.js                     # English translations dictionary
│   │   │   └── index.jsx                 # I18nProvider & useI18n hook
│   │   ├── pages/                        # Application views
│   │   │   ├── BoardView.jsx             # Interactive Kanban board
│   │   │   ├── Dashboard.jsx             # Workspaces dashboard & metrics
│   │   │   ├── Login.jsx                 # Sign in page
│   │   │   ├── NotFound.jsx              # 404 page
│   │   │   └── Register.jsx              # Sign up page
│   │   ├── routes/                       # Route guards
│   │   │   └── ProtectedRoute.jsx
│   │   ├── styles/                       # Modular Design System
│   │   │   ├── globals.css               # Base layout, typography, components
│   │   │   ├── rtl.css                   # RTL & bidirectional styles
│   │   │   └── themes.css                # Light & Dark design tokens
│   │   ├── App.jsx                       # Main application shell
│   │   ├── index.css                     # Entry stylesheet
│   │   └── main.jsx                      # React DOM mount point
│   ├── index.html                        # HTML entry with Cairo/Inter fonts
│   ├── package.json
│   └── vite.config.js                    # Vite configuration with API proxy
├── backend/                              # Backend Express Application
│   ├── Project/                          # Master prompt & project specifications
│   │   └── do it .txt
│   ├── postman/                          # Full API Postman collection
│   │   └── Task-Management-System.postman_collection.json
│   ├── src/
│   │   ├── config/                       # Database connection
│   │   │   └── db.js
│   │   ├── controllers/                  # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── board.controller.js
│   │   │   ├── list.controller.js
│   │   │   └── task.controller.js
│   │   ├── middleware/                   # Express middlewares
│   │   │   ├── auth.middleware.js        # JWT verify & board authorization
│   │   │   ├── error.middleware.js       # Centralized error handling
│   │   │   └── validate.middleware.js    # express-validator runner
│   │   ├── models/                       # Mongoose database models
│   │   │   ├── Board.js
│   │   │   ├── List.js
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/                       # Express router definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── board.routes.js
│   │   │   ├── list.routes.js
│   │   │   └── task.routes.js
│   │   ├── utils/                        # Response and error helpers
│   │   │   ├── apiResponse.js
│   │   │   └── appError.js
│   │   ├── validators/                   # Input validation rules
│   │   │   ├── auth.validator.js
│   │   │   ├── board.validator.js
│   │   │   ├── list.validator.js
│   │   │   └── task.validator.js
│   │   ├── app.js                        # Express application instance
│   │   └── server.js                     # Server entry point
│   ├── tests/
│   │   └── api.test.js                   # 25 Comprehensive integration tests
│   ├── .env.example
│   └── package.json
├── .env.example                          # Root environment example
├── package.json                          # Workspace orchestration scripts
└── README.md
```

---

## 5. Environment Variables / إعداد متغيرات البيئة

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management
JWT_SECRET=super_secret_jwt_key_task_management_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 6. How to Run the Application / طريقة التشغيل

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB running locally on port `27017` (or MongoDB Atlas URI)

### Quick Start (from project root)

1. **Install dependencies for both Backend and Frontend:**
   ```bash
   npm run install:all
   ```

2. **Start the Backend Server (Port 5000):**
   ```bash
   npm run backend
   # or: cd backend && npm run dev
   ```

3. **Start the Frontend Client (Port 5173):**
   ```bash
   npm run frontend
   # or: cd frontend && npm run dev
   ```

4. **Access the application in your browser:**
   ```text
   http://localhost:5173
   ```

---

## 7. Testing / تشغيل الاختبارات

Run the automated Jest API test suite:

```bash
npm run test
# or: cd backend && npm test
```
```

### Test Coverage (25 Passing Integration Tests):
- **Authentication:** Registration, duplicate email rejection, login, invalid credentials, token verification, `/api/auth/me`.
- **Boards:** Board creation, board updates, ownership rules, member permissions, preventing non-members from reading/modifying boards, deleting boards.
- **Lists:** Creating lists, fetching lists, updating list titles, list authorization.
- **Tasks:** Task creation, validation against assigning to non-members, status updates, priority updates, task deletion.
- **Filtering & Pagination:** Status filtering, priority filtering, and pagination metadata validation.

---

## 8. API Documentation & Postman Collection

Import the included Postman collection to test all endpoints:
`postman/Task-Management-System.postman_collection.json`

### Core Endpoints Summary:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/auth/me` | Get current authenticated user | Yes |
| `GET` | `/api/boards` | List boards user is owner or member of | Yes |
| `POST` | `/api/boards` | Create a new board | Yes |
| `GET` | `/api/boards/:id` | Get board details | Yes (Member) |
| `PATCH` | `/api/boards/:id` | Update board title / description | Yes (Owner) |
| `DELETE` | `/api/boards/:id` | Delete board and cascade delete lists/tasks | Yes (Owner) |
| `POST` | `/api/boards/:id/members` | Add member to board by email | Yes (Owner) |
| `DELETE` | `/api/boards/:id/members/:userId` | Remove member from board | Yes (Owner) |
| `GET` | `/api/boards/:id/lists` | Get all lists for a board | Yes (Member) |
| `POST` | `/api/boards/:id/lists` | Create a new list on a board | Yes (Member) |
| `PATCH` | `/api/lists/:id` | Rename list | Yes (Member) |
| `DELETE` | `/api/lists/:id` | Delete list and cascade delete tasks | Yes (Member) |
| `GET` | `/api/tasks` | Get tasks (supports `boardId`, `status`, `priority`, `page`, `limit`) | Yes (Member) |
| `POST` | `/api/lists/:listId/tasks` | Create task inside a list | Yes (Member) |
| `GET` | `/api/tasks/:id` | Get task details | Yes (Member) |
| `PATCH` | `/api/tasks/:id` | Update task details / move list | Yes (Member) |
| `PATCH` | `/api/tasks/:id/status` | Dedicated status update endpoint | Yes (Member) |
| `PATCH` | `/api/tasks/:id/assign` | Dedicated assignee update endpoint | Yes (Member) |
| `DELETE` | `/api/tasks/:id` | Delete a task | Yes (Member) |
