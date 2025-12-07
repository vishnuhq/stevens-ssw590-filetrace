# FileTrace Backend

RESTful API server for the FileTrace audit-first file management platform.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Quick Start](#quick-start)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Tech Stack

| Category    | Package                       | Version |
| ----------- | ----------------------------- | ------- |
| Runtime     | Node.js                       | 24 LTS  |
| Framework   | Express                       | 5.0.1   |
| Database    | MongoDB (native driver)       | 6.11.0  |
| Auth        | jsonwebtoken                  | 9.0.2   |
| Auth        | bcrypt                        | 5.1.1   |
| Security    | Helmet                        | 8.0.0   |
| Security    | CORS                          | 2.8.5   |
| Validation  | Zod                           | 3.24.1  |
| Storage     | @aws-sdk/client-s3            | 3.705.0 |
| Storage     | @aws-sdk/s3-request-presigner | 3.705.0 |
| Upload      | Multer                        | 2.0.2   |
| Environment | dotenv                        | 16.4.7  |
| Testing     | Vitest                        | 4.0.15  |
| Testing     | Supertest                     | 7.1.4   |
| Testing     | mongodb-memory-server         | 10.3.0  |

## Project Structure

```
server/
├── server.js              # Application entry point
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── vitest.config.js       # Test configuration
│
├── config/
│   ├── index.js           # Configuration exports
│   ├── mongoConnection.js # Database connection handler
│   └── createIndexes.js   # MongoDB index definitions
│
├── data/                  # Data access layer
│   ├── index.js           # Exports all data modules
│   ├── users.js           # User CRUD operations
│   ├── files.js           # File CRUD operations
│   ├── shareLinks.js      # Public share link operations
│   ├── userShares.js      # User-to-user share operations
│   └── auditLogs.js       # Audit log operations
│
├── middleware/
│   ├── index.js           # Middleware exports
│   ├── auth.js            # JWT authentication
│   └── auditLogger.js     # Automatic audit logging
│
├── routes/
│   ├── index.js           # Route registration
│   ├── auth.js            # Authentication endpoints
│   ├── files.js           # File management endpoints
│   ├── share.js           # Sharing endpoints
│   └── audit.js           # Audit log endpoints
│
├── utils/
│   └── s3.js              # AWS S3 operations
│
├── validation/
│   └── index.js           # Zod schemas for all inputs
│
└── tests/
    ├── data/              # Data layer tests
    │   ├── users.test.js
    │   ├── files.test.js
    │   └── shareLinks.test.js
    └── routes/            # API route tests
        ├── auth.test.js
        ├── files.test.js
        ├── share.test.js
        └── audit.test.js
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable                | Description                               | Required | Default     |
| ----------------------- | ----------------------------------------- | -------- | ----------- |
| `PORT`                  | Server port                               | No       | 3001        |
| `NODE_ENV`              | Environment (development/production)      | No       | development |
| `CLIENT_URL`            | Frontend URL for CORS and share links     | Yes      | -           |
| `MONGODB_URI`           | MongoDB Atlas connection string           | Yes      | -           |
| `DB_NAME`               | MongoDB database name                     | Yes      | -           |
| `JWT_SECRET`            | Secret key for JWT signing (min 32 chars) | Yes      | -           |
| `AWS_ACCESS_KEY_ID`     | AWS access key                            | Yes      | -           |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                            | Yes      | -           |
| `AWS_REGION`            | AWS region for S3 bucket                  | Yes      | -           |
| `S3_BUCKET_NAME`        | S3 bucket name for file storage           | Yes      | -           |

### Example `.env`

```bash
# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=filetrace

# Auth
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# AWS S3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=filetrace-files
```

## Quick Start

### Prerequisites

- Node.js 20+ (we recommend 24 LTS)
- npm 10+
- MongoDB Atlas account (free M0 tier works)
- AWS account with S3 access

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# (MongoDB URI, JWT secret, AWS keys)

# Start development server (with hot reload)
npm run dev

# Or start production server
npm start
```

The server runs at `http://localhost:3001` by default.

## API Endpoints

The backend exposes 24 endpoints across 4 route groups.

### Authentication (`/api/auth`) - 7 Endpoints

| Method | Endpoint    | Auth | Description                       |
| ------ | ----------- | ---- | --------------------------------- |
| POST   | `/register` | No   | Create new user account           |
| POST   | `/login`    | No   | Login and receive JWT token       |
| POST   | `/logout`   | Yes  | Logout (invalidates client token) |
| GET    | `/me`       | Yes  | Get current user info             |
| PATCH  | `/profile`  | Yes  | Update username or email          |
| PATCH  | `/password` | Yes  | Change password                   |
| DELETE | `/account`  | Yes  | Delete account with cascade       |

### Files (`/api/files`) - 8 Endpoints

| Method | Endpoint              | Auth | Description                                |
| ------ | --------------------- | ---- | ------------------------------------------ |
| GET    | `/my-files`           | Yes  | List all user files with search and filter |
| GET    | `/my-files/:category` | Yes  | List files by category                     |
| POST   | `/upload`             | Yes  | Upload file (multipart form, max 100MB)    |
| GET    | `/download/:fileId`   | Yes  | Get pre-signed download URL                |
| PATCH  | `/:fileId/rename`     | Yes  | Rename file (metadata only)                |
| PATCH  | `/:fileId/move`       | Yes  | Move file to different category            |
| DELETE | `/:fileId`            | Yes  | Delete file with cascade                   |
| GET    | `/:fileId/details`    | Yes  | Get detailed file info                     |

### Sharing (`/api/share`) - 8 Endpoints

| Method | Endpoint                      | Auth | Description                           |
| ------ | ----------------------------- | ---- | ------------------------------------- |
| POST   | `/create`                     | Yes  | Create share link or user share       |
| GET    | `/shared-with-me`             | Yes  | List files shared with current user   |
| GET    | `/file/:fileId/active-shares` | Yes  | List all active shares for a file     |
| PATCH  | `/link/:token/revoke`         | Yes  | Revoke a public share link            |
| PATCH  | `/user/:shareId/revoke`       | Yes  | Revoke a user share                   |
| POST   | `/file/:fileId/revoke-all`    | Yes  | Revoke all shares for a file          |
| GET    | `/:token`                     | No   | View shared file info (public access) |
| POST   | `/:token/download`            | No   | Download shared file (public access)  |

### Audit (`/api/audit`) - 1 Endpoint

| Method | Endpoint        | Auth | Description               |
| ------ | --------------- | ---- | ------------------------- |
| GET    | `/file/:fileId` | Yes  | Get audit logs for a file |

## Database Schema

FileTrace uses MongoDB with 5 collections. We use the native MongoDB driver.

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,        // Unique, 3-30 chars
  email: String,           // Unique, lowercase
  password: String,        // bcrypt hash (10 rounds)
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date        // Optional
}
```

**Indexes:** `email` (unique), `username` (unique)

### Files Collection

```javascript
{
  _id: ObjectId,
  filename: String,        // Display name
  originalFilename: String,// Original upload name
  description: String,     // Optional, max 250 chars
  category: String,        // Personal | Work | Documents | Archive
  size: Number,            // Bytes
  mimetype: String,        // MIME type
  s3Key: String,           // S3 object key (format: userId/uuid-filename)
  ownerId: ObjectId,       // Reference to Users
  uploadedAt: Date,
  lastAccessedAt: Date,
  accessCount: Number,     // Download count
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `ownerId`, `category`, compound `ownerId+category`

### ShareLinks Collection

Stores public share links that anyone can access.

```javascript
{
  _id: ObjectId,
  fileId: ObjectId,        // Reference to Files
  ownerId: ObjectId,       // Reference to Users
  token: String,           // 64-char hex token
  expiresAt: Date,         // Optional expiration
  maxAccessCount: Number,  // Optional access limit
  accessCount: Number,     // Current access count
  isActive: Boolean,       // Can be revoked
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `token` (unique), `fileId`, `ownerId`

### UserShares Collection

Stores shares between registered users.

```javascript
{
  _id: ObjectId,
  fileId: ObjectId,        // Reference to Files
  ownerId: ObjectId,       // Reference to Users (owner)
  recipientId: ObjectId,   // Reference to Users (recipient)
  expiresAt: Date,         // Optional expiration
  maxAccessCount: Number,  // Optional access limit
  accessCount: Number,     // Current access count
  isActive: Boolean,       // Can be revoked
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `recipientId`, `fileId`, compound `fileId+recipientId` (unique)

### AuditLogs Collection

```javascript
{
  _id: ObjectId,
  fileId: ObjectId,        // Reference to Files (nullable for expired links)
  action: String,          // Action type (see below)
  userId: ObjectId,        // User who performed action (nullable)
  username: String,        // Username snapshot
  ipAddress: String,       // Client IP
  location: String,        // Country code from CloudFront
  details: Object,         // Action-specific metadata
  timestamp: Date
}
```

**Actions logged:**

- `UPLOAD` - File uploaded
- `DOWNLOAD` - File downloaded
- `NAME_CHANGE` - File renamed
- `CATEGORY_CHANGE` - File moved to different category
- `DELETE` - File deleted
- `SHARE_CREATED` - Share link or user share created
- `SHARE_REVOKED` - Single share revoked
- `SHARES_REVOKED_ALL` - All shares for a file revoked
- `EXPIRED_LINK_ATTEMPT` - Someone tried to access an expired link

**Indexes:** `fileId`, `timestamp`, compound `fileId+timestamp`

## Testing

We use Vitest with mongodb-memory-server for zero-config testing. Tests run against an in-memory MongoDB instance, so no external database or credentials are needed.

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run with Vitest UI
npm run test:ui
```

### Test Configuration

Tests are completely isolated:

- MongoDB runs in-memory via mongodb-memory-server
- All S3 operations are mocked via `vi.mock()`
- No `.env.test` file needed
- Works offline and in CI/CD with no configuration

### Test Structure

Tests are organized by layer:

- **Data layer tests** (`tests/data/`) - Test database operations directly
- **Route tests** (`tests/routes/`) - Test API endpoints with supertest

## Troubleshooting

### MongoDB Connection Failed

**Error:** `Could not connect to MongoDB`

**Solutions:**

1. Check `MONGODB_URI` is correct in `.env`
2. Verify your IP is whitelisted in MongoDB Atlas (Network Access > Add IP Address)
3. Check MongoDB Atlas cluster is running
4. Ensure username and password are URL-encoded if they contain special characters

### JWT Errors

**Error:** `jwt must be provided` or `JsonWebTokenError`

**Solutions:**

1. Ensure `JWT_SECRET` is set in `.env`
2. JWT secret must be at least 32 characters
3. Check that Authorization header is `Bearer <token>` format
4. Verify token has not expired (24-hour expiration)

### S3 Upload Fails

**Error:** `Access Denied` or `NoSuchBucket`

**Solutions:**

1. Verify AWS credentials in `.env`
2. Check S3 bucket exists and matches `S3_BUCKET_NAME`
3. Verify IAM user has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions
4. Ensure bucket region matches `AWS_REGION`

### File Upload Size Error

**Error:** `File size exceeds 100MB limit`

**Solution:** Maximum file size is 100MB. The limit is configured in `routes/files.js`:

```javascript
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});
```

### Tests Failing with MongoDB Memory Server

**Error:** `Unable to start mongod` or `ENOENT`

**Solutions:**

1. Run `npm install` to ensure mongodb-memory-server is installed
2. Delete `node_modules/.cache` and reinstall
3. On Linux, ensure you have `libcurl4` installed

### CORS Errors in Browser

**Error:** `Access-Control-Allow-Origin` error

**Solutions:**

1. Verify `CLIENT_URL` in `.env` matches your frontend URL exactly
2. Include protocol: `http://localhost:5173` not just `localhost:5173`
3. For production, ensure CloudFront or proxy is configured correctly

## Scripts Reference

| Script          | Command                  | Description               |
| --------------- | ------------------------ | ------------------------- |
| `dev`           | `node --watch server.js` | Start with hot reload     |
| `start`         | `node server.js`         | Start production server   |
| `test`          | `vitest run`             | Run tests once            |
| `test:watch`    | `vitest`                 | Run tests in watch mode   |
| `test:coverage` | `vitest run --coverage`  | Generate coverage report  |
| `test:ui`       | `vitest --ui`            | Open Vitest UI in browser |
