# Smart Secure Campus - Access Control System

A comprehensive, AI-powered access control system with real-time face recognition, monitoring dashboard, and analytics. Built with Node.js, Next.js, Python, and MongoDB.

## 🎯 Overview

Smart Secure Campus is an intelligent security solution designed for campuses and enterprises. It combines:
- **Face Recognition AI** for secure biometric authentication
- **Real-time Access Logging** with instant alerts
- **Admin Dashboard** for monitoring and management
- **Mobile-ready** responsive web interface

## 📁 Project Structure

```
smart-secure-campus/
├── smart-access-backend/      # Node.js/Express backend with API
│   ├── ai-worker/             # Python AI service (face recognition)
│   ├── controllers/           # Route controllers
│   ├── models/                # MongoDB Mongoose models
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic
│   └── README.md              # Backend documentation
│
├── smart-main/                # Next.js frontend dashboard
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # Context providers (Socket.io)
│   │   └── types/             # TypeScript definitions
│   └── README.md              # Frontend documentation
│
└── database/                  # Database setup scripts
    ├── setup-db.sql           # Initial database setup
    └── create-superuser.sql   # Admin user creation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- SQL Server (SQL Server Express or later)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Youssefsamir6/final.git
cd final

# Install backend dependencies
cd smart-access-backend
npm install

# Install frontend dependencies
cd ../smart-main
npm install
```

### 2. Backend Setup

```bash
cd smart-access-backend

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start backend
npm start
# Backend runs on http://localhost:3000
```

### 3. AI Worker Setup

```bash
cd smart-access-backend/ai-worker

# Install Python dependencies
pip install -r requirements.txt

# Start AI worker
python app.py
# AI worker runs on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd smart-main

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3000" >> .env.local

# Start frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Device Integration
- `POST /api/ai/device/smart-access` - Face recognition for access control
  - Headers: `X-API-Key: your-device-key`
  - Body: `image`, `deviceId`, `gateName`

### Access Logs
- `GET /api/logs` - Retrieve access logs with filters
- `GET /api/logs/:id` - Get specific log entry

### User Management (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `POST /api/users/:id/face-images` - Upload face images
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/overview` - Access statistics
- `GET /api/analytics/reports` - Detailed reports

## 🔐 Features

### Security
- ✅ JWT-based authentication
- ✅ API key authentication for devices
- ✅ Role-based access control (Admin, User, Device)
- ✅ Password hashing with bcrypt
- ✅ Secure session management

### Real-time
- ✅ Socket.io for live updates
- ✅ Real-time access event notifications
- ✅ Instant alert system
- ✅ Live dashboard updates

### AI & Recognition
- ✅ Face detection and recognition
- ✅ Multi-face support
- ✅ Confidence scoring
- ✅ Embedding-based matching

### Admin Features
- ✅ User management dashboard
- ✅ Face image management
- ✅ Access history & analytics
- ✅ Alert configuration
- ✅ Device management

## 🗂️ Technology Stack

### Backend
- **Node.js & Express** - Server framework
- **SQL Server** - Database (using `mssql` package)
- **Python** - AI/ML services
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **Multer** - File uploads
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time updates
- **Axios** - API calls
- **React Hooks** - State management

### AI/ML
- **face_recognition** - Face detection & recognition
- **OpenCV** - Computer vision
- **NumPy** - Numerical computing

## 📊 Database Schema (SQL Server)

#### Users Table
```sql
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY(1,1),
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  firstName NVARCHAR(100),
  lastName NVARCHAR(100),
  role NVARCHAR(50), -- 'admin', 'user', 'device'
  isActive BIT DEFAULT 1,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE()
);
```

#### Access Logs Table
```sql
CREATE TABLE AccessLogs (
  id INT PRIMARY KEY IDENTITY(1,1),
  userId INT NOT NULL,
  deviceId NVARCHAR(100),
  gateName NVARCHAR(100),
  accessStatus NVARCHAR(50), -- 'authorized', 'denied'
  confidence FLOAT,
  imageUrl NVARCHAR(500),
  metadata NVARCHAR(MAX),
  timestamp DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES Users(id)
);
```

#### Alerts Table
```sql
CREATE TABLE Alerts (
  id INT PRIMARY KEY IDENTITY(1,1),
  accessLogId INT NOT NULL,
  type NVARCHAR(100), -- 'unauthorized', 'multiple-attempts', 'custom'
  severity NVARCHAR(50), -- 'low', 'medium', 'high'
  message NVARCHAR(MAX),
  isResolved BIT DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  resolvedAt DATETIME,
  FOREIGN KEY (accessLogId) REFERENCES AccessLogs(id)
);
```

## 🔧 Configuration

### Environment Variables (Backend)

Create `.env` file in `smart-access-backend/`:

```
# SQL Server Database
DB_SERVER=127.0.0.1
DB_DATABASE=smart_access_system
DB_PORT=61812
DB_USER=smartaccess
DB_PASSWORD=SmartAccess123!
DB_ENCRYPT=false
DB_TRUST_CERT=true

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# API Keys
DEVICE_API_KEY=dev-key-123
ADMIN_API_KEY=admin-key-123

# Server
NODE_ENV=development
PORT=5000

# AI Worker
AI_WORKER_URL=http://localhost:5000

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Environment Variables (Frontend)

Create `.env.local` file in `smart-main/`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## 📝 Database Setup (SQL Server)

```bash
# Navigate to database folder
cd database

# Run SQL Server setup script using sqlcmd:
sqlcmd -S localhost\SQLEXPRESS01 -U sa -P your_password -i setup-db.sql

# Create superuser account
sqlcmd -S localhost\SQLEXPRESS01 -U sa -P your_password -i create-superuser.sql
```

Or connect via SQL Server Management Studio and run the scripts manually.

Optional seed script:
```bash
cd smart-access-backend
node seed.js
```

## 🧪 Testing

### Backend Tests
```bash
cd smart-access-backend
npm test
```

### Manual API Testing
```bash
# Test face recognition endpoint
curl -X POST http://localhost:3000/api/ai/device/smart-access \
  -H "X-API-Key: dev-key-123" \
  -F "image=@test.jpg" \
  -F "deviceId=cam-main-gate" \
  -F "gateName=Main Gate"
```

## 🚢 Production Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Containers:
# - backend: Node.js API
# - ai-worker: Python AI service
# - frontend: Next.js dashboard
# - sqlserver: SQL Server database
```

### Deployment Checklist
- [ ] Set secure environment variables
- [ ] Configure MongoDB Atlas
- [ ] Enable CORS policies
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service (Nodemailer)
- [ ] Enable logging & monitoring (Sentry)
- [ ] Set up backup strategy
- [ ] Configure CDN for static assets

### Cloud Deployment Options
- **Vercel** - Frontend (Next.js)
- **Render / Railway** - Backend (Node.js)
- **Azure SQL Database** - SQL Server cloud database
- **AWS S3** - Image storage
- **Cloudflare** - CDN & DDoS protection

## 📚 Documentation

- [Backend README](./smart-access-backend/README.md) - Detailed backend documentation
- [Frontend README](./smart-main/README.md) - Frontend setup and usage
- [Advanced Features](./ADVANCED_FEATURES.md) - Extended capabilities
- [Security Improvements](./SECURITY_IMPROVEMENTS.md) - Security best practices
- [TODO](./TODO.md) - Planned features and improvements

## 🔒 Security Considerations

- **Never commit `.env` files** - Use `.env.example` for configuration templates
- **Use HTTPS in production** - Enable SSL/TLS certificates
- **Rotate secrets regularly** - Update API keys and JWT secrets
- **Validate input** - Sanitize all user inputs on backend
- **Rate limiting** - Implement rate limits on API endpoints
- **CORS policy** - Configure CORS to allow only trusted origins
- **Database security** - Use strong SQL Server passwords, enable Windows authentication where possible
- **SQL Injection prevention** - Use parameterized queries (avoid string concatenation)
- **Image security** - Encrypt stored face images, use secure upload endpoints

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Biometric integration (fingerprint, iris)
- [ ] Integration with access card systems
- [ ] Visitor management system
- [ ] Advanced reporting tools
- [ ] API rate limiting dashboard

## 🐛 Known Issues

See [TODO.md](./TODO.md) for current issues and improvements.

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@smartsecure.local

## 📄 License

This project is proprietary. All rights reserved.

## 👨‍💻 Author

**Youssef Samir** - [@Youssefsamir6](https://github.com/Youssefsamir6)

---

**Happy Coding! 🚀**

Last Updated: May 2026
