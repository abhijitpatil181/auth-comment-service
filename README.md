# Authentication & Comments Service

A backend service built with Node.js, Express, and MongoDB that provides user authentication, authorization, session management, and role-based comment permissions.

## Features

- ✅ User Authentication (Signup, Login, Logout)
- ✅ JWT-based Token System (Access & Refresh Tokens)
- ✅ Password Reset Flow (Token-based)
- ✅ Role-based Permissions (read, write, delete)
- ✅ Comment System with Permission Control
- ✅ Secure Password Hashing
- ✅ Input Validation & Error Handling
- ✅ Rate Limiting & Security Headers

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access & Refresh Tokens)
- **Security**: bcryptjs, helmet, cors, rate-limiting
- **Validation**: express-validator

## Project Structure

```
auth-comments-service/
├── models/
│   ├── User.js              # User model with permissions
│   └── Comment.js           # Comment model
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User management
│   └── commentRoutes.js     # Comment operations
├── middleware/
│   ├── auth.js              # Authentication & authorization
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Global error handling
├── utils/
│   └── tokenUtils.js        # JWT token utilities
├── .env                     # Environment variables
├── package.json
├── server.js               # Main server file
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd auth-comments-service

# Install dependencies
npm install

# Install nodemon for development (optional)
npm install -g nodemon
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth_comments_db
JWT_ACCESS_SECRET=your_super_secret_access_key_here_make_it_long_and_complex
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_different_and_long
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12
NODE_ENV=development
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically connect and create the database.

### 5. Running the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. User Signup

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "permissions": {
      "read": true,
      "write": false,
      "delete": false
    }
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### 2. User Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. Refresh Token

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

#### 4. Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

#### 5. Forgot Password

```http
POST /api/auth/forgot-password
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

#### 6. Reset Password

```http
POST /api/auth/reset-password
```

**Request Body:**

```json
{
  "token": "reset_token_from_forgot_password",
  "newPassword": "newpassword123"
}
```

#### 7. Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### 1. Get All Users

```http
GET /api/users
Authorization: Bearer <access_token>
```

#### 2. Get User by ID

```http
GET /api/users/:userId
Authorization: Bearer <access_token>
```

#### 3. Update User Permissions

```http
PUT /api/users/:userId/permissions
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  }
}
```

### Comment Endpoints

#### 1. Get All Comments

```http
GET /api/comments
Authorization: Bearer <access_token> (optional but required for viewing)
```

#### 2. Add Comment (requires 'write' permission)

```http
POST /api/comments
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "content": "This is my comment"
}
```

#### 3. Delete Comment (requires 'delete' permission)

```http
DELETE /api/comments/:commentId
Authorization: Bearer <access_token>
```

#### 4. Get Comments by User

```http
GET /api/comments/user/:userId
Authorization: Bearer <access_token>
```

## Permission System

Each user has three permissions:

- **read**: Can view comments
- **write**: Can add new comments
- **delete**: Can delete any comment

Default permissions for new users:

- read: `true`
- write: `false`
- delete: `false`

## Example cURL Commands

### 1. User Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
```
