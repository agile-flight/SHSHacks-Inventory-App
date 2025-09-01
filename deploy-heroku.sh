#!/bin/bash

echo "🚀 Deploying to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    heroku login
fi

# Create Heroku app if it doesn't exist
echo "📱 Creating Heroku app..."
heroku create angaaza-inventory-backend --buildpack heroku/nodejs

# Add PostgreSQL addon
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini

# Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set NODE_ENV=production

# Deploy the backend
echo "📦 Deploying backend..."
cd backend
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Get the backend URL
BACKEND_URL=$(heroku info -s | grep web_url | cut -d= -f2)
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy frontend to Vercel/Netlify
echo "🌐 Frontend deployment options:"
echo "1. Vercel (recommended):"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repo"
echo "   - Set Root Directory: angazaa/app2"
echo "   - Add environment variable: REACT_APP_API_URL=$BACKEND_URL"
echo ""
echo "2. Netlify:"
echo "   - Go to https://netlify.com"
echo "   - Import your GitHub repo"
echo "   - Set Build Command: cd angazaa/app2 && npm install && npm run build"
echo "   - Set Publish Directory: angazaa/app2/build"
echo "   - Add environment variable: REACT_APP_API_URL=$BACKEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Backend URL: $BACKEND_URL"
