# Node.js E-commerce API (TypeScript)

A full-featured e-commerce backend API built with Node.js, Express, MongoDB, and TypeScript. This project includes authentication, product management, order processing, and admin functionality with image upload capabilities.

## Features

- **TypeScript Support**: Fully converted from JavaScript to TypeScript with comprehensive type definitions
- **Authentication & Authorization**: JWT-based auth with access/refresh tokens
- **User Management**: Registration, login, profile updates
- **Product Management**: CRUD operations with image uploads and reviews
- **Order Management**: Complete order processing system
- **Admin Panel**: Admin-only routes and functionality
- **Image Upload**: File upload with Multer
- **Input Validation**: Joi-based validation
- **Error Handling**: Centralized error handling middleware
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodeJS-learning
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```
   MONGO_URI=mongodb://localhost:27017/your-database
   JWT_SECRET=your-jwt-secret
   PORT=3000
   ```

4. **Build and Start**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Build TypeScript to JavaScript
   npm run build
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/signin` - Login user
- `POST /api/tokenIsValid` - Verify token
- `POST /api/refreshToken` - Refresh access token
- `GET /api/` - Get user data (authenticated)
- `PUT /api/updateProfile` - Update user profile (authenticated)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search=:name` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (authenticated)
- `PUT /api/products/:id` - Update product (authenticated)
- `DELETE /api/products/:id` - Delete product (authenticated)
- `POST /api/products/:id/review` - Add product review (authenticated)

### Orders
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders` - Get user orders (authenticated)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `PUT /api/admin/orders/:id` - Update order status (admin only)

## Project Structure

```
src/
├── controllers/          # Route controllers
├── middlewares/          # Custom middleware
├── models/              # Mongoose models
├── routes/              # Route definitions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── validator/           # Input validation schemas
└── index.ts            # Application entry point
```

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory
- `npm run type-check` - Check TypeScript without building

### TypeScript Features

- **Type Safety**: Full type coverage for all models, controllers, and middleware
- **Interface Definitions**: Comprehensive interfaces for all data structures
- **Error Handling**: Type-safe error handling with custom error interfaces
- **Validation**: Type-safe input validation with Joi
- **Express Extensions**: Custom request interfaces for authenticated routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure TypeScript compilation passes: `npm run build`
5. Submit a pull request

## License

This project is licensed under the ISC License. 
 
 