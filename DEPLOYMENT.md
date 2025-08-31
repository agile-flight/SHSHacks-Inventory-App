# Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended)
1. **Backend**: Connect GitHub repo to Railway
   - Set environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - Railway provides MySQL database

2. **Frontend**: Deploy to Vercel
   - Connect GitHub repo to Vercel
   - Set environment variable: `REACT_APP_API_URL` (your Railway backend URL)

### Option 2: Heroku
1. **Backend**: 
   ```bash
   heroku create your-app-name
   heroku addons:create jawsdb:kitefin
   git push heroku main
   ```

2. **Frontend**: Deploy build folder to Netlify/Vercel

### Option 3: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd angazaa/app2
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
PORT=5050
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

## Database Setup
Run the SQL script in `backend/setup-db.sql` to create tables and sample data.

## Features Demonstrated
- ✅ Device inventory management
- ✅ QR code generation for sharing
- ✅ CSV export functionality
- ✅ Responsive web interface
- ✅ RESTful API endpoints
- ✅ Production-ready build
