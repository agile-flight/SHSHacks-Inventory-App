# Angaaza Inventory Management System

A web-based inventory management system for tracking devices and equipment.

## Features

- Add and manage device inventory
- View devices in a searchable table
- Generate QR codes for device sharing
- Export device details to CSV
- Responsive web interface

## Tech Stack

- **Frontend**: React.js with Formik, DataTables, QR Code generation
- **Backend**: Node.js with Express
- **Database**: MySQL

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SHSHacks-Inventory-App
   ```

2. **Setup Database**
   - Create a MySQL database
   - Update database credentials in `backend/server.js`

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../angazaa/app2
   npm install
   ```

4. **Start the Application**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from angazaa/app2 directory)
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5050

## Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set environment variables for database connection
- Update CORS settings for production domain

### Frontend Deployment
- Build the React app: `npm run build`
- Deploy to platforms like Vercel, Netlify, or GitHub Pages
- Update API endpoint URLs for production

## API Endpoints

- `GET /devices` - Get all devices
- `GET /devices/:id` - Get specific device
- `POST /devices` - Add new device
- `DELETE /devices/:id` - Delete device

## Database Schema

```sql
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(50),
    os VARCHAR(50),
    vendor VARCHAR(50),
    device_name VARCHAR(100),
    size VARCHAR(20),
    cpu VARCHAR(50),
    condit VARCHAR(20),
    location VARCHAR(100)
);
```

## License

ISC
