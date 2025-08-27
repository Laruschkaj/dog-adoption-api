Dog Adoption Platform API
A RESTful API for a dog adoption platform, built with Node.js, Express, and MongoDB. This application allows users to register, authenticate, manage dogs for adoption, and adopt dogs from other users.

Features
User Authentication: JWT-based authentication with 24-hour token validity
Dog Management: Register dogs for adoption with name and description
Dog Adoption: Adopt available dogs with thank-you messages
Dog Removal: Remove your own dogs (if not adopted)
List Management: View your registered and adopted dogs with pagination
Security: Password hashing, rate limiting, CORS protection
Testing: Comprehensive test suite with Mocha and Chai
Modern Frontend: Beautiful, responsive web interface
Technologies Used
Backend: Node.js, Express.js, MongoDB, Mongoose
Authentication: JWT, bcryptjs
Security: Helmet, CORS, express-rate-limit
Testing: Mocha, Chai, chai-http
Frontend: HTML5, CSS3, JavaScript, Lucide Icons
Quick Start
Prerequisites
Node.js (v16 or higher)
MongoDB Atlas account
Git
Installation
Clone the repository
bash
git clone https://github.com/yourusername/dog-adoption-api.git
cd dog-adoption-api
Install dependencies
bash
npm install
Set up environment variables Update .env file with your MongoDB Atlas credentials:
bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dog-adoption-dev?retryWrites=true&w=majority
DB_NAME=dog-adoption-dev
TEST_DB_NAME=dog-adoption-test
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-long-random-jwt-secret-string-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
Seed the database with sample data
bash
npm run seed
Start the server
bash
# Development mode
npm run dev

# Production mode
npm start
Open the application Visit http://localhost:3000 in your browser to access the web interface.
API Documentation
Base URL
http://localhost:3000/api
Authentication Endpoints
Register User
http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
Login User
http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
Dog Management Endpoints
All dog endpoints require authentication via JWT token in the Authorization header:

Authorization: Bearer <your_jwt_token>
Register a Dog
http
POST /api/dogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Buddy",
  "description": "A friendly golden retriever looking for a loving home",
  "imageUrl": "https://example.com/dog-image.jpg"
}
Adopt a Dog
http
PUT /api/dogs/:id/adopt
Authorization: Bearer <token>
Content-Type: application/json

{
  "thankYouMessage": "Thank you for taking such good care of Buddy!"
}
Remove a Dog
http
DELETE /api/dogs/:id
Authorization: Bearer <token>
Get Registered Dogs
http
GET /api/dogs/registered?status=available&page=1&limit=10
Authorization: Bearer <token>
Get Adopted Dogs
http
GET /api/dogs/adopted?page=1&limit=10
Authorization: Bearer <token>
Testing
Run the comprehensive test suite:

bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
The test suite includes:

User registration and authentication tests
Dog management operation tests
Error handling and edge case tests
Database operation tests
Test Database
The application uses a separate test database to avoid affecting development data. Update .env.test with your test database credentials.

Project Structure
dog-adoption-api/
├── controllers/           # Request handlers and business logic
├── middleware/           # Custom middleware functions
├── models/              # Database schemas and models
├── routes/              # API route definitions
├── tests/               # Test files
├── scripts/             # Utility scripts (seeding, etc.)
├── public/              # Static files (web interface)
├── .env                 # Environment variables
├── .env.test           # Test environment variables
├── app.js              # Main application file
├── db.js               # Database connection
└── package.json        # Dependencies and scripts
Sample Users
After running the seed script, you can use these credentials to test the application:

Username: sarah_loves_dogs, Password: password123
Username: mike_adoption_center, Password: password123
Username: emma_rescue_volunteer, Password: password123
Security Features
Password hashing with bcryptjs
JWT authentication with 24-hour expiration
Rate limiting (100 requests per 15 minutes)
CORS protection
Security headers with Helmet.js
Input validation and sanitization
Development
bash
# Start development server
npm run dev

# Run tests
npm test

# Seed database
npm run seed
Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License.

