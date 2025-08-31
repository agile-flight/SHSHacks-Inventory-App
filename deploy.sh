#!/bin/bash

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd angazaa/app2
npm install
npm run build
cd ../..

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to your preferred platform (Heroku, Railway, etc.)"
echo "2. Set environment variables for database connection"
echo "3. Deploy frontend build folder to Vercel, Netlify, etc."
echo "4. Update REACT_APP_API_URL in frontend environment"
echo ""
echo "🔗 Useful commands:"
echo "- Backend: cd backend && npm start"
echo "- Frontend dev: cd angazaa/app2 && npm start"
