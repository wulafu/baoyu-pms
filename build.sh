#!/bin/bash

echo "🚀 Starting Deployment Build..."

# 1. Build Frontend
echo "📦 Building Frontend..."
cd baoyu-pms-web
npm install
npm run build
cd ..

# 2. Build Backend
echo "📦 Building Backend..."
cd backend
npm install
npm run build
cd ..

echo "✅ Build Complete!"
echo "👉 To start the production server:"
echo "   cd backend"
echo "   npm start"
