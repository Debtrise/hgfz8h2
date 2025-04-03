#!/bin/bash

# Update package lists
sudo apt-get update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Install Git
sudo apt-get install -y git

# Install build essentials
sudo apt-get install -y build-essential

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo "MongoDB version:"
mongod --version
echo "Git version:"
git --version 