# Integration Features Documentation

This document describes the new features and integrations added to the FLIT platform.

## Table of Contents
- [Backend Features](#backend-features)
  - [Cloudinary Integration](#cloudinary-integration)
  - [SendGrid Email Service](#sendgrid-email-service)
  - [Financial Management](#financial-management)
- [Frontend Features](#frontend-features)
  - [Admin Login](#admin-login)
  - [Authentication System](#authentication-system)
  - [File Upload Component](#file-upload-component)
- [Configuration](#configuration)
- [Testing](#testing)

## Backend Features

### Cloudinary Integration

The platform now uses Cloudinary for cloud-based file storage instead of local file storage.

**Features:**
- Automatic image optimization and transformation
- Support for multiple file types (images, videos, documents, audio)
- Base64 upload support
- File deletion capability
- Secure URL generation

**Endpoints:**
- `POST /media/upload` - Upload a file to Cloudinary
- `POST /media/upload-base64` - Upload base64 encoded file
- `DELETE /media/delete` - Delete a file from Cloudinary

**Usage Example:**
```typescript
// Using the API
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'vehicles'); // Optional

const response = await fetch('http://localhost:3000/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Configuration:**
Add to `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### SendGrid Email Service

Professional email service integration with beautiful HTML templates.

**Features:**
- Verification emails with OTP codes
- Password reset emails
- Welcome emails
- Ride confirmation emails
- Custom HTML email templates

**Email Templates:**
1. **Verification Email** - Sent when users register
2. **Password Reset Email** - Sent for password reset requests
3. **Welcome Email** - Sent after successful verification
4. **Ride Confirmation Email** - Sent when ride is confirmed

**Configuration:**
Add to `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@flit.com
SENDGRID_FROM_NAME=FLIT
```

**Integration Points:**
- Registration flow automatically sends verification email
- Password reset flow sends OTP via email
- All email sending includes error handling with console fallback

### Financial Management

Enhanced payment analytics and financial reporting system.

**New Endpoints:**

1. **Payment Analytics**
   - `GET /payments/analytics?startDate=2024-01-01&endDate=2024-12-31`
   - Returns comprehensive payment statistics including:
     - Total payments count
     - Total revenue
     - Average payment amount
     - Payments by status
     - Revenue by status

2. **Revenue by Period**
   - `GET /payments/revenue/period?period=day`
   - Periods: `day`, `week`, `month`, `year`
   - Returns:
     - Total revenue for period
     - Transaction count
     - Average transaction amount

3. **Pending Payouts**
   - `GET /payments/payouts/pending`
   - Returns all completed payments pending payout to drivers

**Example Response:**
```json
{
  "totalPayments": 150,
  "totalRevenue": 12500.00,
  "averagePayment": 83.33,
  "paymentsByStatus": {
    "pending": 5,
    "processing": 2,
    "completed": 140,
    "failed": 3,
    "refunded": 0
  },
  "revenueByStatus": {
    "completed": 11666.67,
    "pending": 416.67,
    "processing": 166.67,
    "failed": 250.00,
    "refunded": 0
  }
}
```

## Frontend Features

### Admin Login

A dedicated login page for admin and manager access to the console.

**Features:**
- Clean, modern UI design
- Form validation
- Role-based access control (Admin and Manager only)
- Loading states
- Error handling
- Automatic redirect to console on success

**Location:** `/login`

**Credentials:**
Default admin credentials (from seeder):
- Email: `tachera@ekilie.com`
- Password: `tachera@ekilie`

Manager credentials:
- Email: `support@ekilie.com`
- Password: `supprt@ekilie`

### Authentication System

Complete authentication flow with context provider and route protection.

**Components:**
1. **AuthContext** (`lib/auth/auth-context.tsx`)
   - Manages authentication state
   - Provides login/logout functions
   - Handles token storage
   - Automatic route protection

2. **API Client** (`lib/api-client.ts`)
   - Centralized API communication
   - Automatic token injection
   - Type-safe methods for CRUD operations
   - File upload support

**Features:**
- Persistent authentication (localStorage)
- Automatic redirect on logout
- Protected routes (console pages)
- Token-based API requests

**Usage:**
```typescript
import { useAuth } from '@/lib/auth/auth-context';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  
  // Use authentication state
}
```

### File Upload Component

Reusable file upload component with Cloudinary integration.

**Features:**
- Drag and drop support
- Image preview
- File size validation
- Upload progress indication
- Success/error feedback
- Customizable file types and size limits

**Location:** `components/upload/file-upload.tsx`

**Usage:**
```tsx
import { FileUpload } from '@/components/upload/file-upload';

<FileUpload
  onUploadComplete={(url, publicId) => {
    console.log('File uploaded:', url);
  }}
  folder="vehicles"
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  label="Upload Vehicle Photo"
/>
```

## Configuration

### Backend Environment Variables

Create a `.env` file in `apps/backend/` based on `.env.example`:

```env
# Common
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# App Details
APP_NAME='FLIT'
APP_DESCRIPTION='App Description'

# JWT
JWT_SECRET=your_secure_secret_key

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=flit
DB_LOGGING=false
DB_SYNC=true

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@flit.com
SENDGRID_FROM_NAME=FLIT
```

### Frontend Environment Variables

Create a `.env.local` file in `apps/website/` based on `.env.local.example`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Testing

### Backend Testing

1. **Build Test:**
   ```bash
   cd apps/backend
   npm run build
   ```

2. **Lint Test:**
   ```bash
   cd apps/backend
   npm run lint
   ```

3. **Start Development Server:**
   ```bash
   cd apps/backend
   npm run start:dev
   ```

### Frontend Testing

1. **Build Test:**
   ```bash
   cd apps/website
   npm run build
   ```

2. **Lint Test:**
   ```bash
   cd apps/website
   npm run lint
   ```

3. **Start Development Server:**
   ```bash
   cd apps/website
   npm run dev
   ```

### Manual Testing Checklist

- [ ] Admin can login with correct credentials
- [ ] Non-admin users are denied access
- [ ] Invalid credentials show error message
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated
- [ ] File upload to Cloudinary works
- [ ] Email sending works (check SendGrid logs)
- [ ] Payment analytics endpoint returns correct data
- [ ] Revenue by period endpoint works
- [ ] Pending payouts endpoint works

## Security Considerations

1. **Cloudinary:** Updated to version 2.7.0 to fix argument injection vulnerability
2. **Authentication:** JWT tokens stored in localStorage (consider httpOnly cookies for production)
3. **Email Service:** API keys stored in environment variables
4. **File Upload:** File type and size validation implemented
5. **API Routes:** All admin routes protected with JWT authentication and role guards

## Future Enhancements

1. **Backend:**
   - Implement Redis for OTP storage (currently in-memory)
   - Add rate limiting for API endpoints
   - Implement webhook handlers for payment providers
   - Add more granular permission system

2. **Frontend:**
   - Implement real-time dashboard updates
   - Add data visualization for analytics
   - Create admin user management interface
   - Add bulk operations for entities

## Support

For issues or questions:
- Backend API: Check Swagger documentation at `http://localhost:3000/api`
- Frontend: Review browser console for errors
- Email: Verify SendGrid dashboard for email delivery status
- File Upload: Check Cloudinary dashboard for uploaded files
