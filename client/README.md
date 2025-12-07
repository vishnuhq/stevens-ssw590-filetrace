# FileTrace Frontend

React client for the FileTrace audit-first file management platform.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Quick Start](#quick-start)
5. [Pages Overview](#pages-overview)
6. [Components](#components)
7. [API Integration](#api-integration)
8. [Styling](#styling)
9. [Build and Deploy](#build-and-deploy)
10. [Troubleshooting](#troubleshooting)

## Tech Stack

| Category    | Package            | Version |
| ----------- | ------------------ | ------- |
| Framework   | React              | 19.2.0  |
| Routing     | React Router       | 7.9.6   |
| Build       | Vite               | 7.2.2   |
| Styling     | Tailwind CSS       | 4.1.17  |
| Icons       | Lucide React       | 0.554.0 |
| HTTP        | Axios              | 1.13.2  |
| Validation  | Zod                | 4.1.12  |
| Toasts      | Sonner             | 2.0.7   |
| File Upload | @rpldy/uploady     | 1.12.0  |
| UI          | @headlessui/react  | 2.2.9   |
| UI          | @floating-ui/react | 0.27.16 |

## Project Structure

```
client/
├── src/
│   ├── pages/                    # 11 page components
│   │   ├── Landing.jsx           # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Category hub
│   │   ├── FilesList.jsx         # File management
│   │   ├── FileUpload.jsx        # Upload interface
│   │   ├── RenameFile.jsx        # Rename file page
│   │   ├── ShareFile.jsx         # Share creation
│   │   ├── SharedWithMe.jsx      # Files shared with user
│   │   ├── AuditLogs.jsx         # Audit trail viewer
│   │   ├── PublicShare.jsx       # Public file access
│   │   └── UserProfile.jsx       # Profile management
│   │
│   ├── components/
│   │   ├── layout/               # Layout components
│   │   │   ├── Navbar.jsx        # Top navigation bar
│   │   │   ├── Breadcrumb.jsx    # Breadcrumb navigation
│   │   │   └── ProtectedRoute.jsx# Auth guard
│   │   │
│   │   ├── FileManagement/       # File operation modals
│   │   │   ├── FileActionsMenu.jsx
│   │   │   ├── FileInformationModal.jsx
│   │   │   ├── MoveFileModal.jsx
│   │   │   └── RenameModal.jsx
│   │   │
│   │   ├── ShareManagement/      # Share modals
│   │   │   ├── ViewSharesModal.jsx
│   │   │   ├── ShareCard.jsx
│   │   │   └── SharedFileDetailsModal.jsx
│   │   │
│   │   ├── UserProfile/          # Profile modals
│   │   │   ├── EditProfileModal.jsx
│   │   │   ├── ChangePasswordModal.jsx
│   │   │   └── DeleteAccountModal.jsx
│   │   │
│   │   └── AuditLogs/            # Audit components
│   │       └── AuditLogDetailsModal.jsx
│   │
│   ├── utils/
│   │   ├── api.js                # Axios API client
│   │   ├── auth.js               # Auth helpers and formatters
│   │   └── validation.js         # Zod validation schemas
│   │
│   ├── App.jsx                   # Router configuration
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Tailwind CSS configuration
│
├── package.json
├── vite.config.js
├── eslint.config.js
└── .env.example
```

## Environment Variables

Create a `.env` file in the client directory:

| Variable       | Description     | Required | Default                   |
| -------------- | --------------- | -------- | ------------------------- |
| `VITE_API_URL` | Backend API URL | No       | http://localhost:3001/api |

### Example `.env`

```bash
# Development
VITE_API_URL=http://localhost:3001/api

# Production
VITE_API_URL=https://api.filetrace.vishnuhq.com/api
```

**Note:** Vite requires environment variables to start with `VITE_` to be accessible in the browser.

## Quick Start

### Prerequisites

- Node.js 20+ (we recommend 24 LTS)
- npm 10+
- Backend server running (see server/README.md)

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Pages Overview

The application has 11 pages organized into public and protected routes.

### Public Pages (No Authentication)

| Route           | Page        | Description                       |
| --------------- | ----------- | --------------------------------- |
| `/login`        | Landing     | Email and password login form     |
| `/register`     | Register    | User registration with validation |
| `/share/:token` | PublicShare | Public file download page         |

### Protected Pages (Authentication Required)

| Route                   | Page         | Description                               |
| ----------------------- | ------------ | ----------------------------------------- |
| `/dashboard`            | Dashboard    | Category hub with file counts             |
| `/files/:category`      | FilesList    | File management with search, sort, filter |
| `/upload`               | FileUpload   | Drag and drop file upload                 |
| `/file/:id/rename`      | RenameFile   | Rename file (preserves extension)         |
| `/file/:id/share`       | ShareFile    | Create share links or user shares         |
| `/file/:id/audit`       | AuditLogs    | View complete audit trail                 |
| `/files/shared-with-me` | SharedWithMe | Files shared with current user            |
| `/profile`              | UserProfile  | Profile settings and account management   |

## Components

### Layout Components

| Component        | Purpose                            |
| ---------------- | ---------------------------------- |
| `Navbar`         | Top navigation with user menu      |
| `Breadcrumb`     | Breadcrumb navigation trail        |
| `ProtectedRoute` | Auth guard that redirects to login |

### File Management Components

| Component              | Purpose                         |
| ---------------------- | ------------------------------- |
| `FileActionsMenu`      | Dropdown menu with file actions |
| `FileInformationModal` | Display file metadata           |
| `MoveFileModal`        | Move file between categories    |
| `RenameModal`          | Quick rename modal              |

### Share Management Components

| Component                | Purpose                            |
| ------------------------ | ---------------------------------- |
| `ViewSharesModal`        | List all active shares for a file  |
| `ShareCard`              | Individual share display card      |
| `SharedFileDetailsModal` | Details for files shared with user |

### User Profile Components

| Component             | Purpose                       |
| --------------------- | ----------------------------- |
| `EditProfileModal`    | Update username and email     |
| `ChangePasswordModal` | Change password form          |
| `DeleteAccountModal`  | Account deletion confirmation |

## API Integration

### Configuration

The API client is configured in `src/utils/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

### Authentication

JWT tokens are automatically attached to requests:

```javascript
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Modules

**authAPI:**

- `login(email, password)` - Login and receive token
- `register(userData)` - Create new account
- `logout()` - Clear local storage
- `updateProfile(updates)` - Update username or email
- `changePassword(data)` - Change password
- `deleteAccount(data)` - Delete account

**fileAPI:**

- `getMyFiles(category)` - List files by category
- `uploadFile(formData)` - Upload file
- `getDownloadUrl(fileId)` - Get download URL
- `renameFile(fileId, filename)` - Rename file
- `moveFile(fileId, category)` - Move to category
- `deleteFile(fileId)` - Delete file
- `getFileDetails(fileId)` - Get file metadata

**shareAPI:**

- `createShare(data)` - Create share link or user share
- `getShareByToken(token)` - Get public share info
- `downloadSharedFile(token)` - Download via public link
- `getSharedWithMe()` - Files shared with user
- `getActiveSharesForFile(fileId)` - All active shares for file
- `revokeShareLink(token)` - Revoke public link
- `revokeUserShare(shareId)` - Revoke user share
- `revokeAllShares(fileId)` - Revoke all shares

**auditAPI:**

- `getFileAuditLogs(fileId)` - Get audit trail

## Styling

### Tailwind CSS v4 Configuration

Tailwind CSS v4 uses CSS-first configuration. No `tailwind.config.js` file is needed.

**vite.config.js:**

```javascript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**src/index.css:**

```css
@import 'tailwindcss';

@theme {
  --color-primary: #3b5f8f;
  --color-secondary: #c17e5d;
  --color-error: #c53929;
  --color-success: #4a7c59;
  /* ... more custom properties */
}
```

### Component Classes

**Buttons:**

- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-outline` - Outlined button
- `.btn-danger` - Destructive action button

**Forms:**

- `.input-field` - Styled input, select, textarea

**Cards:**

- `.card` - Basic card container
- `.card-hover` - Card with hover effect

### Color Scheme

| Color      | Hex     | Usage               |
| ---------- | ------- | ------------------- |
| Primary    | #3B5F8F | Main actions, links |
| Secondary  | #C17E5D | Accent elements     |
| Background | #F9F7F4 | Page background     |
| Text       | #2D2A26 | Body text           |
| Success    | #4A7C59 | Success states      |
| Error      | #C53929 | Error states        |

## Build and Deploy

### Available Scripts

| Script    | Command        | Description              |
| --------- | -------------- | ------------------------ |
| `dev`     | `vite`         | Start development server |
| `build`   | `vite build`   | Create production build  |
| `preview` | `vite preview` | Preview production build |
| `lint`    | `eslint .`     | Run ESLint               |

### Production Build

```bash
# Create optimized build
npm run build

# Output directory: dist/
```

### Deploy to S3

The CI/CD pipeline handles deployment automatically. For manual deployment:

```bash
# Build the application
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Troubleshooting

### CORS Errors

**Error:** `Access-Control-Allow-Origin` blocked

**Solutions:**

1. Verify backend `CLIENT_URL` matches `http://localhost:5173`
2. Ensure backend server is running
3. Check for protocol mismatch (http vs https)

### 401 Unauthorized

**Error:** Requests failing with 401

**Solutions:**

1. Clear localStorage: `localStorage.clear()`
2. Login again to get a fresh token
3. Check token expiration (24-hour limit)

### Styles Not Applying

**Error:** Tailwind classes not working

**Solutions:**

1. Ensure `@import 'tailwindcss';` is in index.css
2. Restart the dev server
3. Clear browser cache

### Environment Variables Not Working

**Error:** `VITE_API_URL` is undefined

**Solutions:**

1. Variable must start with `VITE_`
2. Create `.env` file in client directory (not root)
3. Restart dev server after changes

### File Upload Fails

**Error:** Upload returns error

**Solutions:**

1. Check file size (max 100MB)
2. Verify backend S3 credentials are configured
3. Check network tab for specific error

## Scripts Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create production build
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```
