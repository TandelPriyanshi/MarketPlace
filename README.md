# Marketplace Application

A full-stack marketplace application with role-based access control built with React, TypeScript, Node.js, and MySQL.

## 🌟 Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (Seller, Delivery, Salesman, Customer)
- Protected routes and middleware
- Password hashing with bcryptjs
- Refresh token support

### Seller Dashboard
- Product management (CRUD operations)
- Order management and tracking
- Assign delivery personnel
- Sales analytics and reporting
- Store management

### Delivery Dashboard
- View assigned orders
- Update delivery status
- Upload proof of delivery
- Route optimization
- Delivery history tracking

### Salesman Dashboard
- Manage beats and stores
- Log store visits with GPS tracking
- Performance metrics and analytics
- Customer relationship management
- Target achievement tracking
- **Fixed**: All salesman pages now load without errors
- **Fixed**: Beat selection UI for visits and orders
- **Fixed**: Null reference errors in StoreVisitForm and SalesOrderForm

### Customer Dashboard
- Browse and search products
- Place orders with multiple payment options
- Real-time order tracking
- Submit and track complaints
- Review and rating system
- Wishlist management

## 🛠 Tech Stack

### Frontend
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query (TanStack Query)** - Server state management
- **React Router DOM v6** - Client-side routing
- **Radix UI** - Accessible UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Database
- **Sequelize** - ORM with TypeScript support
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Swagger** - API documentation
- **Multer** - File uploads
- **Joi** - Data validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Nodemon** - Development server
- **Concurrently** - Run multiple scripts

## 📁 Project Structure

```
marketplace/
├── client/                     # React frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/               # API services and axios configuration
│   │   ├── app/               # App components and layouts
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-specific components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── store/             # Redux store configuration
│   │   └── types/             # TypeScript type definitions
│   ├── .env                   # Environment variables (don't commit)
│   ├── .gitignore             # Git ignore file
│   ├── package.json           # Dependencies and scripts
│   └── vite.config.ts         # Vite configuration
├── server/                     # Node.js backend application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── db/               # Database configuration and migrations
│   │   ├── dto/              # Data transfer objects
│   │   ├── middleware/        # Express middleware
│   │   ├── models/           # Sequelize models
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Input validation
│   ├── config/               # Runtime configuration
│   ├── logs/                 # Application logs
│   ├── uploads/              # File upload directory
│   ├── .env                  # Environment variables (don't commit)
│   ├── .env.example          # Environment variables template
│   ├── knexfile.js           # Knex migration configuration
│   └── package.json          # Dependencies and scripts
├── .env.example               # Root environment variables template
├── .gitignore                 # Git ignore file
├── knexfile.js               # Root Knex configuration
├── package.json              # Root package.json with scripts
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** or **yarn** package manager
- **MySQL** 8.0 or higher
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TandelPriyanshi/MarketPlace.git
   cd marketplace
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   Or install manually:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Setup environment variables**
   
   **Root directory:**
   ```bash
   cp .env.example .env
   ```
   
   **Server directory:**
   ```bash
   cp server/.env.example server/.env
   ```
   
   **Client directory:**
   ```bash
   cp client/.env.example client/.env
   ```

4. **Configure database**
   - Create a MySQL database named `marketplace_db`
   - Update the database credentials in `server/.env`
   - Run database migrations:
     ```bash
     cd server
     npm run migrate
     ```

5. **Start the development servers**
   ```bash
   # From root directory - starts both client and server
   npm run dev
   
   # Or start individually:
   npm run server  # Starts backend on port 3000
   npm run client  # Starts frontend on port 5173
   ```

### Environment Variables

#### Root `.env`
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=marketplace_db
DB_DIALECT=mysql
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=30d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

#### Client `.env`
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Marketplace
```

## 📖 API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account

#### POST /api/auth/login
Authenticate user and return JWT tokens

#### POST /api/auth/refresh
Refresh access token

#### POST /api/auth/logout
Logout user and invalidate tokens

### User Management

#### GET /api/users/profile
Get current user profile

#### PUT /api/users/profile
Update user profile

#### GET /api/users/:id
Get user by ID (admin only)

### Product Management

#### GET /api/products
Get all products with pagination and filtering

#### GET /api/products/:id
Get product by ID

#### POST /api/products
Create new product (seller only)

#### PUT /api/products/:id
Update product (seller only)

#### DELETE /api/products/:id
Delete product (seller only)

### Order Management

#### GET /api/orders
Get user orders with filtering

#### GET /api/orders/:id
Get order by ID

#### POST /api/orders
Create new order

#### PUT /api/orders/:id/status
Update order status

### API Documentation
- Swagger UI available at: `http://localhost:3000/api-docs`
- Postman collection available in `server/Marketplace_API.postman_collection.json`

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for React components

## 📦 Build & Deployment

### Building for Production

1. **Build frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Build backend**
   ```bash
   cd server
   npm run build
   ```

3. **Build from root**
   ```bash
   npm run build
   ```

### Production Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

#### Using Docker
```bash
# Build image
docker build -t marketplace .

# Run container
docker run -p 3000:3000 marketplace
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Use HTTPS in production
- Configure proper database credentials
- Set up proper file storage (AWS S3, etc.)
- Configure proper logging and monitoring

## 🔧 Development Scripts

### Root Package Scripts
```json
{
  "install-all": "Install dependencies for all packages",
  "start": "Start production server",
  "server": "Start backend in development mode",
  "client": "Start frontend in development mode",
  "dev": "Start both frontend and backend concurrently",
  "build": "Build frontend for production"
}
```

### Client Scripts
```json
{
  "dev": "Start development server",
  "build": "Build for production",
  "build:dev": "Build in development mode",
  "lint": "Run ESLint",
  "preview": "Preview production build"
}
```

### Server Scripts
```json
{
  "start": "Start production server",
  "build": "Compile TypeScript",
  "dev": "Start development server with hot reload",
  "test": "Run Jest tests",
  "lint": "Run ESLint",
  "format": "Format code with Prettier"
}