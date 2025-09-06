# 🤖 AI-Powered Collaborative Knowledge Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)

A full-stack MERN application that enables teams to create, manage, and search knowledge documents with AI-powered features using Google's Gemini AI. Transform your team's knowledge management with intelligent document processing, semantic search, and AI-powered Q&A capabilities.

## 🎯 Live Demo

> **Note**: This is a demo application. For production use, ensure proper security configurations and API key management.

## 📸 Screenshots

| Dashboard | Document Creation | AI Search | Q&A Assistant |
|-----------|------------------|-----------|---------------|
| ![Dashboard](https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Dashboard) | ![Create Doc](https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Create+Document) | ![Search](https://via.placeholder.com/300x200/FF9800/FFFFFF?text=AI+Search) | ![Q&A](https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Q%26A+Assistant) |

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: User and Admin roles with granular permissions
- **Session Management**: Secure token handling with configurable timeouts
- **Input Validation**: Server-side validation for all user inputs

### 📄 Document Management
- **Full CRUD Operations**: Create, read, update, and delete knowledge documents
- **Document Versioning**: Complete version history with diff tracking
- **Rich Text Support**: Markdown support for formatted content
- **File Upload**: Support for document attachments and media

### 🤖 AI-Powered Features
- **Automatic Summarization**: AI generates concise summaries on document creation
- **Intelligent Tag Generation**: Context-aware tag suggestions using content analysis
- **Semantic Search**: AI-powered search that understands meaning, not just keywords
- **Q&A Assistant**: Natural language questions answered using your team's knowledge base
- **Content Analysis**: AI insights and recommendations for document improvement

### 🔍 Advanced Search & Discovery
- **Multi-Modal Search**: Text search, semantic search, and tag-based filtering
- **Search Analytics**: Track search patterns and popular content
- **Smart Suggestions**: AI-powered content recommendations
- **Advanced Filters**: Date range, author, tags, and content type filtering

### 👥 Collaboration Features
- **Activity Feed**: Real-time updates on team document activity
- **User Management**: Team member roles and permissions
- **Document Sharing**: Secure sharing with role-based access
- **Comment System**: Collaborative discussions on documents

### 🎨 User Experience
- **Modern UI**: Material-UI design with responsive layout
- **Dark/Light Theme**: Customizable interface themes
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini AI** for AI features
- **Express Validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** for form management

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Google Gemini API Key** - [Get it from Google AI Studio](https://makersuite.google.com/app/apikey)
- **Git** - [Download here](https://git-scm.com/)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-knowledge-hub.git
cd ai-knowledge-hub
```

> **Note**: Replace `yourusername` with your actual GitHub username

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (server + client)
npm run install-all
```

### 3. Environment Configuration

#### Root Environment File
```bash
cp env.example .env
```

#### Server Environment File
```bash
cp server/env.example server/.env
```

#### Client Environment File (Optional)
```bash
cp client/.env.example client/.env
```

Edit the `.env` files with your configuration:

**Root `.env` file:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/knowledge-hub

# Authentication
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_at_least_32_characters

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Client Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

**Server `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/knowledge-hub
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_at_least_32_characters
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

> **⚠️ Important**: 
> - Never commit your actual `.env` files to version control
> - Generate a secure JWT secret: `openssl rand -base64 32`
> - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Start MongoDB
Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### 5. Run the Application

#### Development Mode (Recommended)
```bash
# Runs both server and client concurrently
npm run dev
```

#### Manual Start
```bash
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the client
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## ⚡ Quick Start

For a quick demo, you can use these sample credentials:
- **Email**: demo@example.com
- **Password**: demo123

> **Note**: This is for demonstration purposes only. Create your own account for actual use.

## 🎬 Demo Video

Watch our comprehensive demo video showcasing all features:

[![Demo Video](https://via.placeholder.com/600x300/FF6B6B/FFFFFF?text=Watch+Demo+Video)](https://youtube.com/watch?v=your-demo-video)

### Demo Highlights:
1. **User Registration & Login** (0:00 - 1:30)
2. **Document Creation with AI** (1:30 - 3:00)
3. **Semantic Search** (3:00 - 4:30)
4. **Q&A Assistant** (4:30 - 6:00)
5. **Version History & Activity** (6:00 - 7:30)
6. **Team Collaboration** (7:30 - 9:00)

## 📱 Usage Guide

### Getting Started
1. **Register**: Create a new account or login with existing credentials
2. **Create Documents**: Start by creating your first knowledge document
3. **AI Features**: Use the AI buttons to generate summaries and tags
4. **Search**: Use text search, semantic search, or tag filtering
5. **Q&A**: Ask questions about your team's documents

### User Roles
- **User**: Can create, edit, and delete their own documents
- **Admin**: Can manage all documents in the system

### Document Features
- **Auto-Summary**: Summaries are generated automatically when creating documents
- **Auto-Tags**: Relevant tags are generated using AI
- **Version History**: View and track document changes over time
- **Collaboration**: See who edited documents and when

### Search Options
1. **Text Search**: Traditional keyword-based search
2. **Semantic Search**: AI-powered search that understands meaning
3. **Tag Search**: Filter documents by specific tags

### Q&A Assistant
- Ask natural language questions about your documents
- Get AI-generated answers with source references
- View which documents were used to answer your question

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get all documents (with pagination and filtering)
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/summarize` - Generate AI summary
- `POST /api/documents/:id/tags` - Generate AI tags
- `GET /api/documents/:id/versions` - Get document versions
- `GET /api/documents/activity/recent` - Get recent activity

### Search
- `GET /api/search/text` - Text-based search
- `POST /api/search/semantic` - AI semantic search
- `GET /api/search/tags` - Tag-based search
- `GET /api/search/tags/all` - Get all available tags

### Q&A
- `POST /api/qa/ask` - Ask AI question
- `GET /api/qa/history` - Get Q&A history

## 🏗️ Project Structure

```
ai-knowledge-hub/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   └── package.json
├── package.json          # Root package.json
├── env.example          # Environment variables example
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **Role-Based Access**: Different permissions for users and admins
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Deployment

### Environment Variables for Production
Make sure to set these environment variables in your production environment:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Build for Production
```bash
# Build the React app
cd client
npm run build

# The built files will be in client/build/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your MONGODB_URI in the .env file

2. **Gemini API Error**
   - Verify your GEMINI_API_KEY is correct
   - Check if you have API quota remaining

3. **Port Already in Use**
   - Change the PORT in your .env file
   - Kill processes using the default ports

4. **CORS Issues**
   - Ensure REACT_APP_API_URL matches your backend URL
   - Check CORS configuration in server.js

### Getting Help
- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed

## 🎯 Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Document templates
- [ ] Advanced analytics and insights
- [ ] Export documents to various formats
- [ ] Integration with external knowledge sources
- [ ] Advanced AI features (document classification, sentiment analysis)
- [ ] Mobile app development
- [ ] Advanced search filters and sorting options

---

**Built with ❤️ using MERN stack and Google Gemini AI**
