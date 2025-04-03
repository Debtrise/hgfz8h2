#!/bin/bash

# Create application directory
APP_DIR="/opt/call-center-app"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create project structure
mkdir -p $APP_DIR/{frontend,backend}
cd $APP_DIR

# Initialize frontend
echo "Setting up frontend..."
cd frontend
npx create-react-app .
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

# Initialize backend
echo "Setting up backend..."
cd ../backend
npm init -y
npm install express@4.18.2 \
  cors@2.8.5 \
  dotenv@16.0.3 \
  jsonwebtoken@9.0.0 \
  bcryptjs@2.4.3 \
  mongoose@7.0.3 \
  morgan@1.10.0 \
  helmet@6.0.1 \
  express-validator@7.0.1

# Create backend directory structure
mkdir -p src/{controllers,routes,middleware,models,config,utils}

# Create backend files
cat > src/server.js << 'EOL'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
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

# Create environment files
echo "Creating environment files..."

# Frontend .env
cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000/api
EOL

# Backend .env
cat > backend/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/call-center
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOL

# Build frontend
echo "Building frontend..."
cd ../frontend
npm run build

# Start MongoDB service
echo "Starting MongoDB..."
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Start the application with PM2
echo "Starting application with PM2..."
cd $APP_DIR/backend
pm2 start src/server.js --name "call-center-backend"

cd $APP_DIR/frontend
pm2 serve build 3000 --name "call-center-frontend" --spa

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "Deployment complete! The application is now running."
echo "Backend API: http://localhost:5000"
echo "Frontend: http://localhost:3000" 