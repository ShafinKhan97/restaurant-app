# Restaurant App - Digital Menu System

This repository contains a full-stack digital menu management system for restaurants.

## Recent Integrations (v1.1)
- **AWS S3 Image Uploads**: Multipart-form uploads for menu item images.
- **Secure Authentication**: Logout blacklisting and JWT management.
- **Password Reset Flow**: Email-based PIN verification and new password reset pages.

## Project Structure
- `/frontend`: Next.js frontend application.
- `/backend`: Node.js/Express backend API.

## Setup Instructions

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file from `.env.example`:
   ```bash
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   # AWS S3 Settings
   AWS_ACCESS_KEY_ID=your_id
   AWS_SECRET_ACCESS_KEY=your_key
   AWS_REGION=eu-north-1
   AWS_S3_BUCKET_NAME=your_bucket
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env.local` file from `.env.local.example`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. `npm run dev`

## Key Implementation Details
- **Image Uploads**: Managed by a dedicated `imageAssetController` that handles both S3 transmission and DB synchronization with the `MenuItem`.
- **Reset Password**: Uses a 6-digit PIN flow. Emails are pre-filled via URL parameters from the forgot-password screen.
- **Security**: JWTs are blacklisted on logout via the `/auth/logout` endpoint.

---
*Created by the development team (Shafin Khan).*
