# PhotoBazaar - Simplified Backend

## Overview
This is a minimal, demo-friendly backend for the PhotoBazaar photography marketplace. It provides all the essential features your frontend needs without unnecessary complexity.

## Key Features
- ✅ **Simple Authentication** - JWT-based login/register
- ✅ **Photo Management** - Upload, list, edit, delete photos
- ✅ **Categories** - Photo categorization
- ✅ **Like System** - Like/unlike photos
- ✅ **User Profiles** - Basic profile management
- ✅ **File Upload** - Local file storage for demo
- ✅ **PostgreSQL** - Production-ready database
- ✅ **CORS Enabled** - Frontend integration ready

## Architecture
- **Single File**: All code in `server-simple.js` for easy understanding
- **Minimal Dependencies**: Only essential packages
- **Demo Ready**: Auto-verification, seeded categories
- **Production Patterns**: Proper error handling, JWT auth

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
Make sure PostgreSQL is running with the credentials in `.env`:
```
DB_NAME=photobazaar
DB_USER=postgres
DB_PASSWORD=kamlesh@123
```

### 3. Start Server
```bash
npm start
```

The server will:
- Connect to PostgreSQL
- Sync database models
- Seed default categories
- Start on port 5001

### 4. Test the API
```bash
# Make the test script executable
chmod +x ../test-simple-backend.sh

# Run tests
../test-simple-backend.sh
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `PUT /api/auth/profile` - Update user profile

### Photos
- `GET /api/photos` - Get all photos (with pagination, search, filters)
- `GET /api/photos/:id` - Get single photo
- `POST /api/photos/upload` - Upload new photo
- `GET /api/photos/my-photos` - Get user's photos
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo (soft delete)
- `POST /api/photos/:id/like` - Like/unlike photo

### Categories
- `GET /api/categories` - Get all categories

### Files
- `GET /uploads/:filename` - Serve uploaded images

## Example Usage

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Upload Photo
```bash
curl -X POST http://localhost:5001/api/photos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "title=Beautiful Sunset" \
  -F "description=A stunning sunset over the mountains" \
  -F "price=29.99" \
  -F "categoryId=1" \
  -F "tags=sunset,nature,landscape"
```

### Get Photos
```bash
curl "http://localhost:5001/api/photos?page=1&limit=12&search=sunset&category=1&sortBy=newest"
```

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `firstName` (String)
- `lastName` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `bio` (Text)
- `profileImage` (String)
- `role` (Enum: user, admin)
- `isVerified` (Boolean, defaults to true)

### Categories
- `id` (Integer, Primary Key)
- `name` (String)
- `slug` (String, Unique)
- `description` (Text)

### Photos
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (Text)
- `price` (Decimal)
- `imageUrl` (String)
- `thumbnailUrl` (String)
- `tags` (JSON Array)
- `views` (Integer)
- `likes` (Integer)
- `isActive` (Boolean)
- `userId` (UUID, Foreign Key)
- `categoryId` (Integer, Foreign Key)

### Likes
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `photoId` (UUID, Foreign Key)

## Frontend Integration

The API is designed to work seamlessly with your existing frontend. Key points:

1. **API Base URL**: `http://localhost:5001/api`
2. **Authentication**: JWT tokens in `Authorization: Bearer TOKEN` header
3. **File Uploads**: Use `FormData` for photo uploads
4. **Image URLs**: Served from `http://localhost:5001/uploads/`
5. **Error Handling**: Consistent error response format

## Demo Features

- **Auto-verification**: Users are automatically verified (no email verification needed)
- **Seeded Categories**: Default categories are created on startup
- **Local File Storage**: Images stored in `uploads/` directory
- **Simplified Auth**: No password reset, email verification, etc.
- **Minimal Validation**: Basic validation for demo purposes

## Production Considerations

For production deployment, consider:
- Environment variables for sensitive data
- Cloud storage for images (Cloudinary, S3)
- Email verification system
- Rate limiting
- Input validation
- Logging
- Database migrations
- SSL certificates

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Create database: `createdb photobazaar`

### Port Conflicts
- Default port is 5001
- Change `PORT` in `.env` if needed

### File Upload Issues
- Check `uploads/` directory exists
- Verify file permissions
- Check file size limits (10MB default)

## File Structure
```
backend/
├── server-simple.js    # Main server file (all-in-one)
├── server.js          # Original complex server
├── package.json       # Dependencies
├── .env              # Environment variables
├── uploads/          # Uploaded images
└── test-simple-backend.sh  # Test script
```

## Support

This simplified backend is designed to be:
- **Easy to understand** - Single file, clear code
- **Demo-friendly** - Works out of the box
- **Frontend-compatible** - Matches your React app's expectations
- **Production-ready patterns** - Can be extended for production use

For issues or questions, check the console logs - they provide detailed information about what's happening.
