#!/bin/bash

# Create project directory
PROJECT_NAME="call-center-app"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize frontend
echo "Setting up frontend..."
npx create-react-app frontend
cd frontend

# Install frontend dependencies
npm install @ant-design/icons@5.3.0 \
  ajv@8.17.1 \
  antd@5.24.3 \
  axios@1.8.2 \
  chart.js@4.4.8 \
  jssip@3.10.1 \
  moment@2.30.1 \
  react-confetti@6.4.0 \
  react-dnd@16.0.1 \
  react-dnd-html5-backend@16.0.1 \
  react-icons@5.5.0 \
  react-router-dom@6.22.3 \
  reactflow@11.11.4 \
  recharts@2.15.1

# Install frontend dev dependencies
npm install --save-dev @types/react@18.3.18 \
  @types/react-dom@18.3.5 \
  loader-utils@3.2.1 \
  typescript@4.9.5

cd ..

# Initialize backend
echo "Setting up backend..."
mkdir -p backend
cd backend

# Initialize package.json for backend
npm init -y

# Install backend dependencies
npm install express@4.18.2 \
  cors@2.8.5 \
  dotenv@16.0.3 \
  jsonwebtoken@9.0.0 \
  bcryptjs@2.4.3 \
  mongoose@7.0.3 \
  morgan@1.10.0 \
  helmet@6.0.1 \
  express-validator@7.0.1

# Install backend dev dependencies
npm install --save-dev nodemon@2.0.22 \
  jest@29.5.0 \
  supertest@6.3.3

# Create backend directory structure
mkdir -p src/{controllers,routes,middleware,models,config,utils}
mkdir -p src/config

# Create basic backend files
cat > src/server.js << 'EOL'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOL

# Create .env file
cat > .env << 'EOL'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/call-center
JWT_SECRET=your-secret-key
EOL

# Create .gitignore
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOL

# Update package.json scripts
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.dev="nodemon src/server.js"
npm pkg set scripts.test="jest"

cd ..

# Create a README.md
cat > README.md << 'EOL'
# Call Center Application

A full-stack call center application with React frontend and Node.js backend.

## Project Structure

```
.
├── frontend/          # React frontend application
└── backend/           # Node.js backend server
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Features

- User Authentication
- Campaign Management
- Lead Management
- Call Center Operations
- Form Builder
- Email and SMS Integration
- Real-time Dashboard

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/call-center
JWT_SECRET=your-secret-key
```
EOL

echo "Project setup complete! 🎉"
echo "To get started:"
echo "1. cd $PROJECT_NAME"
echo "2. cd frontend && npm install"
echo "3. cd ../backend && npm install"
echo "4. Start the backend: npm run dev"
echo "5. In a new terminal, start the frontend: cd frontend && npm start" 