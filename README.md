# Node.js Authentication Project

A complete authentication system built with Node.js, Express, and MongoDB that provides secure user authentication, email verification, and post management functionality.

## Features

### Authentication
- User registration with email validation
- Secure login with JWT token authentication
- Email verification system
- Password management (change password, forgot password)
- Logout functionality
- Strong password validation

### Post Management
- Create, read, update, and delete posts
- Pagination for post listing
- User-specific post management
- Post relationship with users

### Security
- Password hashing with bcryptjs
- JWT for secure authentication
- HMAC for verification code security
- HTTP-only cookies for token storage
- Input validation with Joi
- Helmet for HTTP header security

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login a user
- `POST /api/auth/logout` - Logout a user
- `PATCH /api/auth/send-verification-code` - Send email verification code
- `POST /api/auth/verify-verification-code` - Verify email with code
- `PATCH /api/auth/change-password` - Change user password
- `PATCH /api/auth/send-forgot-password-code` - Send forgot password code
- `POST /api/auth/verify-forgot-password-code` - Reset password with code

### Post Routes
- `GET /api/post/all-posts` - Get all posts with pagination
- `GET /api/post/single-post` - Get a single post by ID
- `POST /api/post/create-post` - Create a new post
- `PUT /api/post/update-post` - Update an existing post
- `DELETE /api/post/delete-post` - Delete a post

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- SMTP server for email functionality

### Installation

1. Clone the repository
   ```
   git clone https://github.com/ngenemicheal/node-auth-project.git
   cd node-auth-project
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   TOKEN_SECRET=your_jwt_secret_key
   HMAC_CODE_VERIFICATION_SECRET=your_hmac_secret
   SMTP_EMAIL_HOST=your_smtp_host
   SMTP_EMAIL_USER=your_email_address
   SMTP_EMAIL_PASSWORD=your_email_password
   NODE_ENV=development
   ```

4. Start the server
   ```
   npm start
   ```

5. For development with auto-restart
   ```
   npm run dev
   ```

## License

ISC

## Author

techie-mike