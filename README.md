# AI Powered Unified Collaboration Platform (Module 3 - Task Management)

CollabSphere is an enterprise-grade Unified Collaboration Platform. This repository contains the complete Modules 1, 2, & 3 codebases, representing the system architecture foundation, project workspaces, role-based memberships, drag-and-drop Kanban task tracking boards, comments, attachments, and change log history audits.

---

## Folder Structure

```
AI-Collaboration-Platform/
├── client/                  # Frontend SPA
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # SVG & media assets
│   │   ├── components/      # Reusable UI Atoms & Guards
│   │   ├── context/         # AuthContext state provider
│   │   ├── hooks/           # useAuth custom hook
│   │   ├── layouts/         # DashboardLayout wrapper
│   │   ├── pages/           # Landing, Login, Profile, etc.
│   │   ├── routes/          # AppRoutes config
│   │   ├── services/        # Axios API client instances
│   │   ├── styles/          # Tailwind import directives
│   │   ├── App.jsx          # Root router wrapper
│   │   └── main.jsx         # Render entrypoint
│   ├── vite.config.js       # Vite configuration with Tailwind v4
│   └── package.json         # Client dependencies
├── server/                  # Backend Node.js server
│   ├── prisma/              # Prisma DB schemas & seeds
│   ├── src/
│   │   ├── config/          # Client exports (Database)
│   │   ├── controllers/     # Controller handlers
│   │   ├── middleware/      # Auth & Rate Limiters
│   │   ├── repositories/    # UserRepository DB layer
│   │   ├── routes/          # Express Router mappings
│   │   ├── services/        # AuthService business logic
│   │   ├── validators/      # express-validators
│   │   ├── utils/           # JWT & AppError classes
│   │   ├── types/           # TS declaration extensions
│   │   └── server.ts        # Server listener
│   ├── tsconfig.json        # Compiler parameters
│   └── package.json         # Server dependencies
├── docs/                    # Architectural documents
│   ├── api_docs.md          # REST API specifications
│   └── testing_instructions.md # Testing guides
└── README.md
```

---

## Environment Variables

Ensure the following configuration settings are placed in local environment files:

### Backend Configuration (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public"
JWT_SECRET="your-super-long-secure-random-key"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## Installation & Setup

Follow these steps to configure your local development environment:

### Prerequisite
Ensure [Node.js](https://nodejs.org) (v18+) and [PostgreSQL](https://www.postgresql.org/) are installed.

### 1. Setup Backend
1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Build the database schema using Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Generate the Prisma Client SDK:
   ```bash
   npx prisma generate
   ```
4. Run the database seed script:
   ```bash
   npm run prisma:seed
   ```
5. Spin up the Express development server:
   ```bash
   npm run dev
   ```
   The backend will start listening at `http://localhost:5000`.

### 2. Setup Frontend
1. Navigate to the client folder and install dependencies:
   ```bash
   cd ../client
   npm install
   ```
2. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
   The client will boot at `http://localhost:5173`.

---

## Seeding & Default Credentials

Seeding the database creates three test accounts:
* **Admin**: `admin@platform.com` (Password: `Password123!`)
* **Manager**: `manager@platform.com` (Password: `Password123!`)
* **Employee**: `employee@platform.com` (Password: `Password123!`)

---

## Real-Time Socket Architecture

CollabSphere integrates Socket.IO to enable real-time messaging, typing indicators, online presence tracking, and smart notification dispatches.

### 1. Connection Authentication
* Every socket connection must pass a JWT token in the connection payload (`auth.token`).
* Sockets are verified using the JWT validator, protecting room accesses from unauthorized connections.

### 2. Room Listings
* `user:{userId}`: Personal notification feeds.
* `project:{projectId}`: Project group workspace updates.
* `conversation:{conversationId}`: Active chat room text exchanges and typing statuses.

### 3. Handled Socket Events
* **Client to Server**:
  * `joinConversation`: Joins a channel room and updates read status.
  * `leaveConversation`: Leaves a channel room.
  * `typing`: Emits typing indicator.
  * `stopTyping`: Disables typing indicator.
  * `readReceipt`: Dispatches read status updates.
* **Server to Client**:
  * `receiveMessage`: Appends message logs.
  * `messageEdited` / `messageDeleted`: Updates message body inline.
  * `userOnline` / `userOffline`: Toggles presence lights.
  * `notification`: Grouped smart notifications alerts.
  * `readReceipt`: Real-time unread dots.
  * `reactionAdded` / `reactionRemoved`: Updates emoji reaction arrays.

## Enterprise File & Document Management (Module 5)

CollabSphere integrates a complete Enterprise File & Document Management System supporting hierarchical folders, versioning, advanced access sharing permissions, and local disk storage fallback.

### 1. Key Features
* **Folder & Drive Explorer**: Standard Drive-like folders and subfolders system. Navigate with responsive breadcrumbs and expandable directory sidebar trees.
* **Multipart File Uploads**: Stream file uploads using Multer on the backend.
* **Cloudinary Integration**: Automatic file hosting with Cloudinary. Auto-generates image thumbnails and handles standard previews.
* **Local Storage Fallback**: Gracefully falls back to server directory disk storage `/uploads` if Cloudinary credentials are not configured.
* **Version History & Control**: Trace every file edit. Each replace creates a new `FileVersion` record. Instantly revert to any historical version.
* **Granular Access Permissions**: Share any file explicitly with colleagues. Set specific permission roles: `VIEW`, `DOWNLOAD`, `EDIT`, or `OWNER`.
* **System-Managed Task Folders**: Attaching files to tasks automatically structures files inside a dedicated `/Tasks/Task-[ID]` folder on the project workspace.
* **SaaS Storage Management**: Visualize total storage consumption. Tracks active usage limits (10 GB SaaS tier).

---

## Enterprise Meeting & Video Conferencing (Module 6)

CollabSphere integrates a complete Enterprise Meeting Management and Video Conferencing System supporting scheduled syncs, calendar dashboards, and secure Jitsi Meet audio/video sessions.

### 1. Key Features
* **Meeting Scheduling Form**: Set titles, detailed agenda descriptions, start/end dates, timezone detection, associated projects, and user invite lists.
* **Interactive Big Calendar**: Full calendar viewport supporting Month, Week, Day, and Agenda grids. Double-clicking any calendar slot allows quick event scheduling.
* **Jitsi Meet Integration**: Seamless HD video rooms initialized dynamically using the Jitsi External API iframe. Custom user display names and muted mic/cam configuration on launch.
* **Attendance & Presence Tracking**: Track acceptances, rejections, and actual attendance times. Database logs joining and leaving times for reporting.
* **Dashboard Widgets**: Front page overview displaying Today's meetings, upcoming schedules, and actionable pending invitations.
* **Activity Notifications**: Dispatches real-time systems alerts to users when invited, updated, or when a meeting goes live.

## Enterprise Analytics & Reporting (Module 8)

CollabSphere integrates a complete Enterprise Analytics and Reporting System supporting role-based dashboards, workload distribution charts, employee productivity scores, and exportable workspace reports.

### 1. Key Features
* **Role-Based dashboards**:
  * **Admin**: Organization overview showing total active workspaces, tasks completion rates, overdue risks, and meetings engagement metrics across all user groups.
  * **Manager**: Team-level statistics focusing on workload distributions and completion velocities of members inside their managed project boards.
  * **Employee**: Individual productivity dial showing assigned/completed tasks, chat messages count, uploaded assets, and AI requests logs.
* **Workspace & Project Analytics**: Detailed graphs representing status distributions, overdue items, average completion times, and computed project health scores.
* **Workload & Capacity Balance**: visual indicators showing team load indexes (Standard capacity set to 8 tasks) to prevent engineer burnouts.
* **Report Compilation Form**: Create structured summaries (Weekly, Monthly, Project, Team, or Employee performance audits) saved directly as Markdown documents.
* **Multi-Format Exports**: One-click download support for CSV data files, Microsoft Excel compatible worksheets, and printable PDF documents.
* **AI Predictive Insights**: Deep-learning integration (via Gemini/OpenAI Providers) to analyze dashboard stats and suggest roadmap adjustments, risks mitigations, and productivity tips.

### 2. REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Fetch dashboard KPI summaries & trend activity | Yes |
| `GET` | `/api/analytics/projects` | List project status distributions & completion times | Yes |
| `GET` | `/api/analytics/team` | Fetch team member workloads & capacity percentages | Yes (Admin/Manager) |
| `GET` | `/api/analytics/employees` | Retrieve employee productivity scores & counts | Yes |
| `GET` | `/api/analytics/meetings` | Fetch meetings facilitation counts & attendance rates | Yes |
| `GET` | `/api/analytics/ai` | Retrieve assistant usage logs & tokens count | Yes |
| `POST` | `/api/reports/generate` | Compile new report (Weekly, Project, etc.) | Yes |
| `GET` | `/api/reports` | List compiled reports accessible to user | Yes |
| `GET` | `/api/reports/download/:id` | Download formatted report output (CSV, XLS, PDF) | Yes |

## Enterprise Administration & Organization Management (Module 9)

CollabSphere features a complete Administration and Organization Management system enabling secure configuration of company metadata, department structures, user activation, audit logs, and granular role permission matrices.

### 1. Key Features
* **Admin Dashboard Overview**: Unified administrative portal displaying total registered users count, active status flags, total project boards, backlog tasks, sync meetings, pending invites, and a live timeline log of system audits.
* **User Management Directory**: Centralized folder directory supporting paginated queries, search, filter by role or department, deactivation/activation locks, direct user creation, and password reset actions.
* **Departments & Managers**: Configure department structures, assign members, allocate manager leads, and monitor performance progress rates dynamically.
* **Granular Role Permission Matrix**: Seed system permissions and map module action layers (e.g. Project, Task, Meeting) to roles (Admin, Manager, Employee).
* **Automated Audit Logs Trails**: Records IP address, browser signatures, timestamps, and target oldValue/newValue changes diffs for events: Logins, Logouts, Project creations, Task deletions, Role modifications, and Settings updates.
* **Secure Registration Invitations**: Generation of unique, secure hex-token links dispatched via email to pre-assign user roles and department attachments upon registration.

### 2. REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Retrieve telemetry metrics & recent log timelines | Admin |
| `GET` | `/api/admin/users` | List paginated users directory with filter options | Admin |
| `POST` | `/api/admin/users` | Create a new user profile directly | Admin |
| `PUT` | `/api/admin/users/:id` | Update user details (name, email, role, department) | Admin |
| `DELETE` | `/api/admin/users/:id` | Permanently delete user profile from database | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Activate or deactivate user workspace account | Admin |
| `PATCH` | `/api/admin/users/:id/reset-password` | Reset access password for selected user | Admin |
| `GET` | `/api/admin/departments` | List all departments and active statistics | Admin |
| `POST` | `/api/admin/departments` | Create a new department folder | Admin |
| `PUT` | `/api/admin/departments/:id` | Modify department manager or name configuration | Admin |
| `DELETE` | `/api/admin/departments/:id` | Delete department from organization | Admin |
| `POST` | `/api/admin/invitations` | Dispatch a secure registration invitation link | Admin |
| `GET` | `/api/admin/invitations` | List pending and revoked registration invitations | Admin |
| `DELETE` | `/api/admin/invitations/:id` | Revoke a dispatched invitation link | Admin |
| `GET` | `/api/admin/settings` | Get organization timezone and branding details | Admin |
| `PUT` | `/api/admin/settings` | Modify organization brand colors and working hours | Admin |
| `GET` | `/api/admin/permissions` | Get full permission matrix configuration | Admin |
| `PUT` | `/api/admin/permissions/:role` | Assign system permission mappings to role | Admin |
| `POST` | `/api/admin/permissions/seed` | Seed default permission capabilities | Admin |
| `GET` | `/api/admin/audit-logs` | Fetch paginated timelines list of system action logs | Admin |

## User Settings, Accessibility, & Personalization (Module 10)

CollabSphere integrates a comprehensive account customization dashboard allowing each user to adjust their system profiles, verify security metrics, toggle notification streams, control accessibility rendering (themes, contrast levels, text resizing, and transition pacing), and review device logs.

### 1. Key Features
* **Settings & Preference Contexts**: Synchronized state management providing real-time layout updates across the client application whenever UI changes are saved.
* **Unified Settings Dashboard**: Navigation panel displaying a Profile summary, Security status, current active theme, and quick shortcuts.
* **Biographical Profiles**: Customize your personal name, phone numbers, bio description, location, personal website, job title, and avatar images.
* **Credential Password Verification**: Change password forms implementing current password matching checks and visual strength grading meters.
* **Real-time Session Auditing**: Timeline layout logging active browser connections, IP addresses, location metrics, and force revoking external active sessions.
* **Trusted Fingerprint Registry**: Bypasses secondary validation checks by registering local browser fingerprint tags.
* **Visual Theme & Language Controls**: Choose Light, Dark, or System themes, customize date/time displays, and select interface languages (English, Hindi, Spanish, French, German).
* **Accessibility Compliance**: Font-sizing controls (small, medium, large), high-contrast overrides, and reduced animation motions.
* **Privacy Visibility Rules**: Configure profile searchability, online presence dots, and choose to toggle AI diagnostic training logs sharing.

### 2. REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/preferences` | Load current user's UI theme, language, and notification states | Authenticated |
| `PUT` | `/api/settings/preferences` | Modify layout rules, notifications, and accessibility flags | Authenticated |
| `PUT` | `/api/settings/profile` | Update profile bio, phone numbers, designations, website | Authenticated |
| `PUT` | `/api/settings/password` | Change user password after verifying current credentials | Authenticated |
| `GET` | `/api/settings/sessions` | List active user logins, browsers, and IP allocations | Authenticated |
| `DELETE` | `/api/settings/sessions/:id` | Revoke a specific active browser session ID | Authenticated |
| `DELETE` | `/api/settings/sessions/other` | Terminate all other sessions except current active tab | Authenticated |
| `GET` | `/api/settings/devices` | List registered trusted browser fingerprint tags | Authenticated |
| `POST` | `/api/settings/devices` | Register a new trusted browser fingerprint | Authenticated |
| `PUT` | `/api/settings/devices/:id` | Rename a trusted device tag label | Authenticated |
| `DELETE` | `/api/settings/devices/:id` | Remove a browser fingerprint from trusted lists | Authenticated |

## Production Hardening & Optimization (Module 11)

CollabSphere integrates comprehensive performance audits, memory-based caching frameworks, security middleware policies, central Morgan logging, Express rate limiting, and an integration testing suite.

### 1. Key Performance Optimizations
* **Database Indexes**: Configured relational indexes (`@@index([userId])`) on `UserSession` and `TrustedDevice` to optimize database join and retrieval speeds.
* **In-Memory Caching Abstraction**: A high-performance caching utility `cache.ts` facilitating memory maps with custom TTL expiration. Built with a structured interface ready to swap with a Redis client.
* **Vite Route Code Splitting**: Overhauled `AppRoutes.jsx` page mappings to use dynamic `React.lazy` imports wrapped in a unified `<React.Suspense>` block. Shrunk the initial JavaScript bundle loading size by splitting pages into lightweight individual bundles.
* **Suspense UX Skeleton Loaders**: Pulse loader layouts render during dynamic page imports to prevent layout shifts.

### 2. Security Hardening
* **Strict Helmet Headers**: Imposed secure Content-Security-Policy (CSP) headers restricting script, styles, and image origin injections.
* **Strict CORS Overrides**: Restricted REST API access to trusted client origins only, with credentials allowed.
* **Brute-Force Rate Limiting**: Enabled maximum connection windows to limit spam requests per IP.
* **Express Input Sanitizer**: Developed custom sanitizers stripping script patterns and HTML entities from incoming request body parameters, parameters, and query lists.
* **Environment Configuration Validator**: Ensures critical variables like `DATABASE_URL` and `JWT_SECRET` are present at startup, terminating corrupt processes early with exit code 1.

### 3. Centralized Logging & Telemetry
* **Logger Utility**: Local standard formatted console logs outputs prefixed with UTC timestamps, warning tags, and error trace objects.
* **API Telemetry Monitoring**: Middleware tracing execution durations, resource memory growth (RSS MB), and operating system CPU load percentages for every request.

### 4. Integration Testing Suite
* **Authentication Integrity**: Jest/Supertest suite verifying input email formats, password rules, and routing guards.
* **Project Dashboard Metrics**: Supertest suite checking database project list filters and request tracing.

---

## Deployment Guide

### Database (Neon / Supabase PostgreSQL)
* Provision a new serverless PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
* Update `DATABASE_URL` in your server production settings.

### Backend (Render / Heroku)
* Select Node.js runtime and link your GitHub repository.
* Set the Root Directory to `server`.
* Set build command: `npm install && npm run build`
* Set start command: `npm run start`
* Configure Environment Variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

### Frontend (Vercel / Netlify)
* Link your GitHub repository and set the Root Directory to `client`.
* Framework Preset: `Vite`.
* Build command: `npm run build`
* Output Directory: `dist`
* Set Environment Variables: `VITE_API_URL` pointing to your hosted Render backend server `/api` path.
