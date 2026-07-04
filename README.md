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
