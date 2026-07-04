# CollabSphere API Documentation (Module 1: Authentication & Profile)

This document contains the REST API specifications for the authentication and user management system of the AI Powered Unified Collaboration Platform.

## Base URL
* **Development**: `http://localhost:5000/api`
* **Production**: `https://your-backend.render.com/api`

---

## Authentication Mechanism

The platform uses JSON Web Tokens (JWT) for secure session management. When a user logs in or registers successfully, the server:
1. Sets an **HttpOnly, Secure, SameSite=None** cookie named `token` containing the JWT.
2. Returns the JWT token explicitly in the JSON response body under `data.token`.

All authenticated requests should pass the token in one of two ways:
* **HttpOnly Cookie**: Automatically sent by the browser when `credentials: true` is set on requests.
* **Authorization Header**: Passed as a Bearer token:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

---

## Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account | No |
| `POST` | `/auth/login` | Authenticate existing credentials | No |
| `POST` | `/auth/logout` | Clear user session cookies | Yes |
| `GET` | `/auth/me` | Fetch active user credentials | Yes |
| `GET` | `/auth/profile` | Fetch active user profile | Yes |
| `PUT` | `/auth/profile` | Update user profile details | Yes |
| `GET` | `/auth/users` | Retrieve list of active system users | Yes |
| `GET` | `/projects` | List projects with page/search filters | Yes |
| `POST` | `/projects` | Create a new project (Admin/Manager) | Yes |
| `GET` | `/projects/:id` | Fetch specific project details | Yes |
| `PUT` | `/projects/:id` | Update project parameters | Yes |
| `DELETE` | `/projects/:id` | Permanently delete project (Admin) | Yes |
| `PATCH` | `/projects/archive/:id` | Set project as archived | Yes |
| `PATCH` | `/projects/restore/:id` | Un-archive project | Yes |
| `POST` | `/projects/:id/members` | Add user to project team | Yes |
| `DELETE` | `/projects/:id/members/:userId` | Remove user from project team | Yes |
| `PATCH` | `/projects/:id/manager` | Transfer manager role (Admin) | Yes |
| `GET` | `/projects/:id/activity` | List project change audit logs | Yes |

---

## Endpoint Details

### 1. Register User
* **Endpoint**: `/api/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@company.com",
    "password": "SecurePassword123!",
    "role": "Employee",
    "phone": "+1234567890",
    "department": "Engineering",
    "designation": "Software Engineer"
  }
  ```
* **Validation Constraints**:
  * `name`: Required, 2-50 characters.
  * `email`: Required, valid email format.
  * `password`: Required, minimum 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
  * `role`: Optional, must be `Admin`, `Manager`, or `Employee` (Defaults to `Employee`).
  * `phone`: Optional, must be valid E.164 phone format.
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
        "name": "John Doe",
        "email": "john@company.com",
        "role": "Employee",
        "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
        "department": "Engineering",
        "designation": "Software Engineer",
        "phone": "+1234567890",
        "isActive": true,
        "createdAt": "2026-07-03T15:10:00.000Z",
        "updatedAt": "2026-07-03T15:10:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 2. Login User
* **Endpoint**: `/api/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "john@company.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
        "name": "John Doe",
        "email": "john@company.com",
        "role": "Employee",
        "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
        "department": "Engineering",
        "designation": "Software Engineer",
        "phone": "+1234567890",
        "isActive": true,
        "lastLogin": "2026-07-03T15:12:00.000Z",
        "createdAt": "2026-07-03T15:10:00.000Z",
        "updatedAt": "2026-07-03T15:12:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 3. Logout User
* **Endpoint**: `/api/auth/logout`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```

### 4. Get Current User / Profile
* **Endpoint**: `/api/auth/me` or `/api/auth/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
        "name": "John Doe",
        "email": "john@company.com",
        "role": "Employee",
        "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
        "department": "Engineering",
        "designation": "Software Engineer",
        "phone": "+1234567890",
        "isActive": true,
        "lastLogin": "2026-07-03T15:12:00.000Z",
        "createdAt": "2026-07-03T15:10:00.000Z",
        "updatedAt": "2026-07-03T15:12:00.000Z"
      }
    }
  }
  ```

### 5. Update Profile
* **Endpoint**: `/api/auth/profile`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Johnathan Doe",
    "phone": "+1999999999",
    "department": "IT Operations",
    "designation": "Lead Developer",
    "avatar": "https://example.com/custom-avatar.png"
  }
  ```
* **Validation Constraints**:
  * `name`: Optional, 2-50 characters.
  * `phone`: Optional, E.164 format.
  * `avatar`: Optional, valid URL.
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
        "name": "Johnathan Doe",
        "email": "john@company.com",
        "role": "Employee",
        "avatar": "https://example.com/custom-avatar.png",
        "department": "IT Operations",
        "designation": "Lead Developer",
        "phone": "+1999999999",
        "isActive": true,
        "createdAt": "2026-07-03T15:10:00.000Z",
        "updatedAt": "2026-07-03T15:13:30.000Z"
      }
    }
  }
  ```

### 6. Get Active Users Directory
* **Endpoint**: `/api/auth/users`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "users": [
        {
          "id": "a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
          "name": "Johnathan Doe",
          "email": "john@company.com",
          "role": "Employee",
          "avatar": "https://example.com/custom-avatar.png",
          "department": "IT Operations",
          "designation": "Lead Developer"
        }
      ]
    }
  }
  ```

### 7. Create Project
* **Endpoint**: `/api/projects`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "code": "MARKETING-2026",
    "name": "Global Q3 Launch Campaign",
    "description": "Orchestrate channels for new feature marketing",
    "status": "PLANNING",
    "priority": "HIGH",
    "startDate": "2026-08-01T00:00:00.000Z",
    "deadline": "2026-10-31T00:00:00.000Z",
    "managerId": "manager-uuid-string-here",
    "members": ["employee-uuid-1", "employee-uuid-2"]
  }
  ```
* **Permissions**: Must be `Admin` or `Manager` role.
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "project": {
        "id": "project-uuid-1234",
        "code": "MARKETING-2026",
        "name": "Global Q3 Launch Campaign",
        "description": "Orchestrate channels for new feature marketing",
        "status": "PLANNING",
        "priority": "HIGH",
        "startDate": "2026-08-01T00:00:00.000Z",
        "deadline": "2026-10-31T00:00:00.000Z",
        "managerId": "manager-uuid-string-here",
        "createdBy": "admin-uuid-here",
        "isArchived": false,
        "createdAt": "2026-07-03T17:15:00.000Z",
        "updatedAt": "2026-07-03T17:15:00.000Z"
      }
    }
  }
  ```

### 8. List Projects
* **Endpoint**: `/api/projects`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `search`: Matches project name or code (case-insensitive substring)
  * `status`: Filters by status value
  * `priority`: Filters by priority value
  * `managerId`: Filters by assigned manager
  * `isArchived`: Boolean filter (defaults to `false`)
  * `page`: Page index (defaults to `1`)
  * `limit`: Page count (defaults to `10`)
* **Permissions**:
  * `Admin` and `Manager` see all matching workspace projects.
  * `Employee` is limited to projects where they are creator, manager, or member.
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "projects": [
      {
        "id": "project-uuid-1234",
        "code": "MARKETING-2026",
        "name": "Global Q3 Launch Campaign",
        "status": "PLANNING",
        "priority": "HIGH",
        "deadline": "2026-10-31T00:00:00.000Z",
        "manager": {
          "id": "manager-uuid-1",
          "name": "Sarah Manager",
          "avatar": "https://avatar-url"
        },
        "members": [
          {
            "userId": "employee-uuid-1",
            "user": {
              "name": "John Doe",
              "avatar": "https://avatar-url"
            }
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
  ```

### 9. Add Team Member
* **Endpoint**: `/api/projects/:id/members`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "userId": "user-uuid-to-add"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "member": {
        "id": "member-relation-uuid",
        "projectId": "project-uuid-1234",
        "userId": "user-uuid-to-add",
        "joinedAt": "2026-07-03T17:16:00.000Z"
      }
    }
  }
  ```

### 10. Get Project Activity Log
* **Endpoint**: `/api/projects/:id/activity`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "activities": [
        {
          "id": "log-uuid-1",
          "action": "CREATE_PROJECT",
          "createdAt": "2026-07-03T17:15:00.000Z",
          "user": {
            "name": "John Admin",
            "avatar": "https://avatar-url"
          }
        }
      ]
    }
  }
  ```

---

## Global Error Responses

The API uses standardized error responses. Any validation or runtime failure yields a response matching:

### Validation Error (400 Bad Request)
```json
{
  "status": "error",
  "message": "Password must be at least 8 characters long; Please provide a valid email"
}
```

### Unauthorized Error (401 Unauthorized)
```json
{
  "status": "error",
  "message": "Invalid or expired token. Please log in again."
}
```

### Forbidden Error (403 Forbidden)
```json
{
  "status": "error",
  "message": "Unauthorized. You do not have permission to access this resource."
}
```


## Chat & Real-Time Communication API

### 1. Create or Get Conversation
* **Endpoint**: `/api/chat/conversations`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "type": "DIRECT",
    "userIds": ["a3b6c2d4-51e6-4279-bb7d-c2d9e68cb5a4"]
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "conversation": {
        "id": "c1a6c2d4-51e6-4279-bb7d-c2d9e68cb5a4",
        "type": "DIRECT",
        "members": []
      }
    }
  }
  ```

### 2. List Conversations
* **Endpoint**: `/api/chat/conversations`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`

### 3. Get Conversation Messages
* **Endpoint**: `/api/chat/messages/:conversationId`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `limit` (default 30), `cursor` (message ID string)

### 4. Send Message (Text / Upload File)
* **Endpoint**: `/api/chat/messages`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Payload**: Form-Data (`conversationId`, `message`, `file` optional)

### 5. Edit Message
* **Endpoint**: `/api/chat/messages/:id`
* **Method**: `PUT`
* **Request Body**: `{ "message": "edited message text" }`

### 6. Delete Message
* **Endpoint**: `/api/chat/messages/:id`
* **Method**: `DELETE`

### 7. Add Reaction
* **Endpoint**: `/api/chat/messages/:id/reactions`
* **Method**: `POST`
* **Request Body**: `{ "emoji": "👍" }`

### 8. Remove Reaction
* **Endpoint**: `/api/chat/messages/:id/reactions`
* **Method**: `DELETE`
* **Request Body**: `{ "emoji": "👍" }`

### 9. Search Messages
* **Endpoint**: `/api/chat/messages/search`
* **Method**: `GET`
* **Query Params**: `q` (search term string)


## Notifications API

### 1. List Grouped Notifications
* **Endpoint**: `/api/notifications`
* **Method**: `GET`

### 2. Mark Notification as Read
* **Endpoint**: `/api/notifications/read/:id`
* **Method**: `PATCH`
* **Request Body**: `{ "ids": ["uuid-1", "uuid-2"] }` (optional array for grouped notifications)

### 3. Mark All Notifications as Read
* **Endpoint**: `/api/notifications/read-all`
* **Method**: `PATCH`

