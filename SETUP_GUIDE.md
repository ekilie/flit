# Setup Guide - FLIT Platform Integration Features

This guide will help you set up and run the newly integrated features including Cloudinary, SendGrid, Admin Login, and Financial Management.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (free tier available)
- SendGrid account (free tier available)

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/ekilie/flit.git
cd flit

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../website
npm install
```

## Step 2: Configure Backend

1. Create a `.env` file in `apps/backend/`:

```bash
cd apps/backend
cp .env.example .env
```

2. Update the `.env` file with your configurations:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_DATABASE=flit
DB_SYNC=true

# JWT Secret (use a strong random string)
JWT_SECRET=your_very_secure_random_secret_key

# Cloudinary Configuration
# Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid Configuration
# Sign up at https://sendgrid.com
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=FLIT

# App Configuration
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
APP_NAME='FLIT'
```

## Step 3: Set Up Cloudinary

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Navigate to Dashboard
3. Copy the following from your dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to your `.env` file

## Step 4: Set Up SendGrid

1. Sign up for a free SendGrid account at https://sendgrid.com
2. Navigate to Settings > API Keys
3. Create a new API key with full access
4. Copy the API key (you won't see it again!)
5. Add it to your `.env` file as `SENDGRID_API_KEY`
6. Verify a sender email address in SendGrid:
   - Go to Settings > Sender Authentication
   - Verify a single sender
   - Use this email in `SENDGRID_FROM_EMAIL`

## Step 5: Set Up Database

1. Create a PostgreSQL database:

```bash
# Using psql
createdb flit

# Or using SQL
psql -U postgres
CREATE DATABASE flit;
\q
```

2. The application will auto-sync the schema when you start it (DB_SYNC=true)

## Step 6: Seed the Database

The backend includes a seeder that creates:
- Admin users
- Sample riders and drivers
- Sample vehicles
- Sample rides
- Pricing configurations

```bash
cd apps/backend

# Start the application (it will seed automatically on first run)
npm run start:dev
```

**Default Admin Credentials:**
- Email: `tachera@ekilie.com`
- Password: `tachera@ekilie`

**Default Manager Credentials:**
- Email: `support@ekilie.com`
- Password: `supprt@ekilie`

## Step 7: Configure Frontend

1. Create a `.env.local` file in `apps/website/`:

```bash
cd apps/website
cp .env.local.example .env.local
```

2. Update the file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 8: Run the Application

### Start Backend

```bash
cd apps/backend
npm run start:dev
```

The backend will be available at: http://localhost:3000

API Documentation (Swagger): http://localhost:3000/api

### Start Frontend

In a new terminal:

```bash
cd apps/website
npm run dev
```

The frontend will be available at: http://localhost:3001

## Step 9: Access Admin Panel

1. Navigate to http://localhost:3001/login
2. Login with admin credentials:
   - Email: `tachera@ekilie.com`
   - Password: `tachera@ekilie`
3. You'll be redirected to the admin console at http://localhost:3001/console

## Testing the Features

### 1. Test Cloudinary File Upload

1. Login to admin panel
2. Navigate to any section with file uploads (e.g., Drivers, Vehicles)
3. Try uploading an image
4. Check your Cloudinary dashboard to see the uploaded file

### 2. Test SendGrid Email Service

**Method 1: User Registration**
```bash
# Using curl
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890",
    "role": "Rider"
  }'
```

Check your email (test@example.com) for the verification code.

**Method 2: Password Reset**
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "tachera@ekilie.com"}'
```

Check the console logs or your SendGrid dashboard for the reset code.

### 3. Test Financial Management API

**Get Payment Analytics:**
```bash
curl -X GET "http://localhost:3000/payments/analytics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Revenue by Period:**
```bash
curl -X GET "http://localhost:3000/payments/revenue/period?period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Pending Payouts:**
```bash
curl -X GET "http://localhost:3000/payments/payouts/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Database Connection Issues

**Error:** "Connection refused" or "database does not exist"

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check database exists: `psql -l | grep flit`
3. Verify credentials in `.env` file

### Cloudinary Upload Fails

**Error:** "Upload failed" or "Invalid credentials"

**Solution:**
1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary dashboard for API key status
3. Ensure cloud name matches exactly (case-sensitive)

### Emails Not Sending

**Error:** "Failed to send email"

**Solution:**
1. Verify SendGrid API key in `.env`
2. Check SendGrid dashboard for API key status
3. Verify sender email is verified in SendGrid
4. Check console logs for detailed error messages
5. Review SendGrid Activity Feed for delivery status

### Login Issues

**Error:** "Access denied" or "Invalid credentials"

**Solution:**
1. Ensure database is seeded (check for users in database)
2. Use exact credentials from seeder:
   - Email: `tachera@ekilie.com`
   - Password: `tachera@ekilie`
3. Check browser console for detailed errors
4. Verify JWT_SECRET is set in backend `.env`

### CORS Issues

**Error:** "CORS policy blocked"

**Solution:**
The backend is configured to allow all origins in development. If you still see CORS errors:
1. Check that backend is running on port 3000
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Clear browser cache and cookies

## Production Deployment Considerations

When deploying to production:

1. **Environment Variables:**
   - Use strong, random JWT_SECRET
   - Set NODE_ENV=production
   - Update APP_URL to production URL
   - Use production database credentials

2. **Security:**
   - Enable HTTPS
   - Set secure cookie flags
   - Implement rate limiting
   - Add CSRF protection
   - Use httpOnly cookies for tokens

3. **SendGrid:**
   - Verify domain for better deliverability
   - Set up custom sender domain
   - Configure webhook for email events

4. **Cloudinary:**
   - Set up folder structure
   - Configure upload presets
   - Enable auto-moderation if needed
   - Set up webhooks for upload events

5. **Database:**
   - Set DB_SYNC=false
   - Use migrations for schema changes
   - Enable SSL connection
   - Regular backups

## Getting Help

- **Backend Issues:** Check Swagger docs at http://localhost:3000/api
- **Frontend Issues:** Check browser console and Network tab
- **Email Issues:** SendGrid Activity Feed shows delivery status
- **File Upload Issues:** Cloudinary Media Library shows all uploads
- **Database Issues:** Check PostgreSQL logs

## Next Steps

1. Explore the API documentation at http://localhost:3000/api
2. Review the codebase structure in INTEGRATION_FEATURES.md
3. Customize email templates in `apps/backend/src/lib/email/email.service.ts`
4. Add custom Cloudinary transformations for different use cases
5. Extend financial reporting with custom analytics

Enjoy building with FLIT! 🚗
