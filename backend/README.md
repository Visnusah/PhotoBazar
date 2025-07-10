# PhotoBazaar Backend

Backend API for PhotoBazaar - A photo marketplace application built with Express.js, Sequelize ORM, and PostgreSQL.

## Features

- User authentication and authorization
- Photo upload and management
- Search and filtering
- Purchase transactions
- User profiles and portfolios
- Category management
- File upload with Cloudinary integration

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Validation**: Joi

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=photobazaar
DB_USER=your_db_user
DB_PASSWORD=your_db_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Setup PostgreSQL database:
```bash
createdb photobazaar
```

4. Run migrations:
```bash
npm run db:migrate
```

5. Seed the database:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Photos
- `GET /api/photos` - Get all photos (with filtering)
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos` - Upload new photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Purchases
- `POST /api/purchases` - Purchase a photo
- `GET /api/purchases` - Get user's purchases

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/photos` - Get photos by user
