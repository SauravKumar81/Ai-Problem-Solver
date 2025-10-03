# 🤖 AI Problem Solver Hub

A full-stack MERN application that uses Generative AI to solve various types of problems including coding, mathematics, writing, debugging, and more.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure JWT-based auth with role-based access
- 🧠 **AI-Powered Solutions** - Integration with OpenAI GPT-4 and Anthropic Claude
- 💻 **Code Execution** - Safe sandboxed code execution via Judge0 API
- 📊 **Solution History** - Store and search past problems and solutions
- 🎯 **Multi-Category Support** - Programming, Math, Writing, Debugging, Data Science
- 📈 **Admin Dashboard** - Comprehensive analytics and user management
- ⚡ **Real-time Processing** - Fast AI response with progress indicators
- 🔍 **Smart Search** - Filter and search through problem history
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **OpenAI API** - GPT-4 integration
- **Anthropic API** - Claude integration
- **Judge0 API** - Code execution sandbox
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
- **RapidAPI Key** - [Get it here](https://rapidapi.com/) (for Judge0)
- **Git** - Version control

## 🚀 Quick Start

### Automated Setup (Recommended)

1. **Download the setup script:**
```bash
# Make the script executable
chmod +x setup.sh

# Run the setup
./setup.sh
```

### Manual Setup

#### 1. Clone or Create Project Directory
```bash
mkdir ai-problem-solver
cd ai-problem-solver
```

#### 2. Backend Setup
```bash
# Create backend directory
mkdir server
cd server

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv helmet morgan express-rate-limit openai @anthropic-ai/sdk axios

# Install dev dependencies
npm install --save-dev nodemon

# Create directory structure
mkdir config models routes middleware services
```

#### 3. Create Backend Environment File
Create `server/.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-problem-solver
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-problem-solver

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Anthropic API (Optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Judge0 for Code Execution
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your-rapidapi-key-here

# Client URL (CORS)
CLIENT_URL=http://localhost:5173
```

#### 4. Frontend Setup
```bash
# Go back to project root
cd ..

# Create React app with Vite
npm create vite@latest client -- --template react
cd client

# Install dependencies
npm install axios lucide-react react-router-dom

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create directory structure
mkdir -p src/components src/context src/services src/pages
```

#### 5. Configure Tailwind CSS
Update `client/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 6. Copy All Component Files

Copy the following files from the artifacts provided:

**Backend Files:**
- `server.js` → `server/server.js`
- `User.js` → `server/models/User.js`
- `Problem.js` → `server/models/Problem.js`
- `auth.js` (routes) → `server/routes/auth.js`
- `problems.js` → `server/routes/problems.js`
- `admin.js` → `server/routes/admin.js`
- `auth.js` (middleware) → `server/middleware/auth.js`
- `aiService.js` → `server/services/aiService.js`
- `codeExecutor.js` → `server/services/codeExecutor.js`

**Frontend Files:**
- `Auth.jsx` → `client/src/components/Auth.jsx`
- `ProblemForm.jsx` → `client/src/components/ProblemForm.jsx`
- `SolutionDisplay.jsx` → `client/src/components/SolutionDisplay.jsx`
- `Dashboard.jsx` → `client/src/components/Dashboard.jsx`
- `AdminDashboard.jsx` → `client/src/components/AdminDashboard.jsx`
- `Navbar.jsx` → `client/src/components/Navbar.jsx`
- `AuthContext.jsx` → `client/src/context/AuthContext.jsx`
- `App.jsx` → `client/src/App.jsx`

## 🎯 Running the Application

### Start Backend
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

### Start Frontend (New Terminal)
```bash
cd client
npm run dev
```
Frontend will start on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Problem Endpoints

#### Submit Problem
```http
POST /api/problems
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Find Prime Numbers",
  "description": "Write a function to find all prime numbers up to n",
  "category": "programming",
  "language": "python",
  "difficulty": "medium",
  "tags": ["algorithm", "math"]
}
```

#### Get User's Problems
```http
GET /api/problems?page=1&limit=10&category=programming
Authorization: Bearer <token>
```

#### Get Single Problem
```http
GET /api/problems/:id
Authorization: Bearer <token>
```

#### Delete Problem
```http
DELETE /api/problems/:id
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer <admin-token>
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true,
  "subscription": {
    "plan": "pro",
    "queryLimit": 500
  }
}
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  apiUsage: {
    totalQueries: Number,
    monthlyQueries: Number,
    lastResetDate: Date
  },
  subscription: {
    plan: String (enum: ['free', 'pro', 'enterprise']),
    queryLimit: Number
  },
  timestamps: true
}
```

### Problem Model
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  category: String (enum),
  language: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  tags: [String],
  status: String (enum: ['pending', 'solved', 'failed']),
  solution: ObjectId (ref: Solution),
  timestamps: true
}
```

### Solution Model
```javascript
{
  problem: ObjectId (ref: Problem),
  aiModel: String,
  answer: String,
  explanation: String,
  code: {
    language: String,
    snippet: String,
    optimizedVersion: String
  },
  steps: [{
    stepNumber: Number,
    description: String,
    code: String
  }],
  executionResult: Object,
  tokenUsage: Object,
  processingTime: Number,
  timestamps: true
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Prevents API abuse
- **Helmet.js** - Security headers
- **CORS Protection** - Configured origins
- **Input Validation** - Mongoose schema validation
- **Code Execution Sandbox** - Judge0 isolated environment

## 🎨 UI Components

### Available Pages
- **Login/Signup** - User authentication
- **Problem Form** - Submit new problems
- **Dashboard** - View problem history
- **Solution Display** - Detailed AI solutions
- **Admin Panel** - User and system management

### Key Features
- Responsive design (mobile-first)
- Dark mode support ready
- Loading states and animations
- Error handling and notifications
- Accessibility compliant

## 📦 Deployment

### Backend Deployment (Railway)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy:**
```bash
cd server
railway login
railway init
railway up
```

3. **Add Environment Variables:**
- Go to Railway dashboard
- Add all variables from `.env`

### Backend Deployment (Render)

1. Push code to GitHub
2. Connect Render to your repository
3. Create a new Web Service
4. Add environment variables
5. Deploy

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd client
vercel
```

3. **Update API URL:**
- Set `VITE_API_URL` to your backend URL

### Frontend Deployment (Netlify)

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build and Deploy:**
```bash
cd client
npm run build
netlify deploy --prod
```

## 🧪 Testing

### Create Admin User
Manually update a user in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Test the Application
1. Register a new user
2. Login with credentials
3. Submit a problem (e.g., "Write a Python function for Fibonacci")
4. View the AI-generated solution
5. Check dashboard for history
6. Login as admin to access admin panel

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list            # macOS

# Start MongoDB
sudo systemctl start mongod   # Linux
brew services start mongodb-community  # macOS
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Unix/Mac
netstat -ano | findstr :5000   # Windows
```

### CORS Errors
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.js`

### API Key Issues
- Verify all API keys are valid and active
- Check rate limits on OpenAI/RapidAPI dashboards
- Ensure keys are properly set in `.env`

## 🔧 Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment mode | No |
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| OPENAI_API_KEY | OpenAI API key | Yes |
| ANTHROPIC_API_KEY | Anthropic API key | No |
| JUDGE0_API_URL | Judge0 API endpoint | Yes (for code execution) |
| RAPIDAPI_KEY | RapidAPI key | Yes (for Judge0) |
| CLIENT_URL | Frontend URL (CORS) | Yes |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## 📈 Performance Optimization

### Backend
- MongoDB indexing on frequently queried fields
- Response caching with Redis (optional)
- Pagination for large datasets
- Query optimization
- Rate limiting per user

### Frontend
- Code splitting with React.lazy
- Image optimization
- Lazy loading components
- Debouncing search inputs
- Memoization with useMemo/useCallback

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Judge0 for code execution
- MongoDB for database
- The MERN community

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Multi-language support (i18n)
- [ ] Real-time collaboration
- [ ] Code playground with Monaco Editor
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Social authentication (Google, GitHub)
- [ ] Mobile app (React Native)
- [ ] WebSocket for real-time updates
- [ ] Export solutions as PDF
- [ ] Community forum

---

Made with ❤️ using MERN Stack + AI