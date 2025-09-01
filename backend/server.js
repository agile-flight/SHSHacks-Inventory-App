const express = require("express");
const mysql = require("mysql");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let db;
let pgPool;

// Check if we're using PostgreSQL (Render) or MySQL (local)
if (process.env.DATABASE_URL) {
    // PostgreSQL for Render deployment
    console.log('Using PostgreSQL connection');
    pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    // Create table for PostgreSQL
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS devices (
            id SERIAL PRIMARY KEY,
            serial_number VARCHAR(50),
            os VARCHAR(50),
            vendor VARCHAR(50),
            device_name VARCHAR(100),
            size VARCHAR(20),
            cpu VARCHAR(50),
            condit VARCHAR(20), 
            location VARCHAR(100),
            mac_address VARCHAR(17),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    pgPool.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating devices table:', err.message);
            return;
        }
        console.log('PostgreSQL devices table created or already exists');
    });
} else {
    // MySQL for local development
    console.log('Using MySQL connection');
    db = mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "sys",
        port: process.env.DB_PORT || 3306
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err.message);
            return;
        }
        console.log('Connected to MySQL database');
        
        db.query(`CREATE TABLE IF NOT EXISTS devices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serial_number VARCHAR(50),
            os VARCHAR(50),
            vendor VARCHAR(50),
            device_name VARCHAR(100),
            size VARCHAR(20),
            cpu VARCHAR(50),
            condit VARCHAR(20), 
            location VARCHAR(100),
            mac_address VARCHAR(17)
        )`, (err) => {
            if (err) {
                console.error('Error creating devices table:', err.message);
                return;
            }
            console.log('MySQL devices table created or already exists');
        });
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    return res.send("Welcome to the Device Management System");
});

// Database helper function
const query = (sql, params = []) => {
    if (pgPool) {
        return pgPool.query(sql, params);
    } else {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
};

app.get('/devices', async (req, res) => {
    try {
        const sql = "SELECT * FROM devices ORDER BY id DESC";
        const result = await query(sql);
        return res.json(pgPool ? result.rows : result);
    } catch (err) {
        console.error('Error querying devices:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/devices/:id', async (req, res) => {
    try {
        const deviceId = req.params.id;
        const sql = "SELECT * FROM devices WHERE id = $1";
        const result = await query(sql, [deviceId]);
        const data = pgPool ? result.rows : result;
        
        if (data.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        return res.json(data[0]);
    } catch (err) {
        console.error('Error querying device details:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/devices', async (req, res) => {
    try {
        const { serial_number, os, vendor, device_name, size, cpu, condit, location, mac_address } = req.body;
        const sql = "INSERT INTO devices (serial_number, os, vendor, device_name, size, cpu, condit, location, mac_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
        const result = await query(sql, [serial_number, os, vendor, device_name, size, cpu, condit, location, mac_address]);
        return res.json({ success: true, message: 'Device added successfully', device: pgPool ? result.rows[0] : result });
    } catch (err) {
        console.error('Error inserting into devices:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/devices/:id', async (req, res) => {
    try {
        const deviceId = req.params.id;
        const sql = "DELETE FROM devices WHERE id = $1";
        const result = await query(sql, [deviceId]);
        const affectedRows = pgPool ? result.rowCount : result.affectedRows;
        
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        return res.json({ success: true, message: 'Device deleted successfully' });
    } catch (err) {
        console.error('Error deleting device:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
