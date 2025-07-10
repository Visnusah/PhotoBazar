# PhotoBazaar - Photography Marketplace

A modern photography marketplace built with React, Node.js, Sequelize ORM, and PostgreSQL.

## Features

### Frontend (React + Vite)
- 🎨 Modern UI with Tailwind CSS
- 🔐 User authentication and authorization
- 🖼️ Photo browsing and filtering
- 🛒 Photo purchasing system
- 👤 User profiles and portfolios
- 📱 Responsive design
- ⚡ Fast performance with Vite

### Backend (Node.js + Express)
- 🗄️ PostgreSQL database with Sequelize ORM
- 🔑 JWT-based authentication
- 📁 File upload with Multer/Cloudinary support
- 🔍 Advanced search and filtering
- 💳 Purchase transaction system
- 👥 User role management (User, Photographer, Admin)
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)

## Project Structure

```
photobazaar/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   └── data/              # Mock data
├── backend/               # Backend API server
│   ├── config/            # Database configuration
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── seeds/             # Database seeds
└── public/                # Static assets
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Run setup script (will install deps, create DB, and seed data)
./setup.sh

# Or manually:
npm install
createdb photobazaar
npm run db:init
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
- `POST /api/photos/:id/like` - Like/unlike photo

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Purchases
- `POST /api/purchases` - Purchase a photo
- `GET /api/purchases` - Get user's purchases
- `POST /api/purchases/:id/download` - Download purchased photo

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/photos` - Get photos by user
- `GET /api/users/:id/dashboard` - Get user dashboard stats

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=photobazaar
DB_USER=postgres
DB_PASSWORD=your_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Heroicons

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT
- Multer
- Cloudinary
- Joi (validation)
- Helmet (security)

## License

MIT License
