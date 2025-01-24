const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "sys"
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
        location VARCHAR(100)
    )`, (err) => {
        if (err) {
            console.error('Error creating devices table:', err.message);
            return;
        }
        console.log('Devices table created or already exists');
    });
});

app.get('/', (req, res) => {
    return res.send("Welcome to the Device Management System");
});

app.get('/devices', (req, res) => {
    const sql = "SELECT * FROM devices";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error querying devices:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.json(data);
    });
});

app.get('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const sql = "SELECT * FROM devices WHERE id = ?";
    db.query(sql, deviceId, (err, data) => {
        if (err) {
            console.error('Error querying device details:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        return res.json(data[0]);
    });
});

app.post('/devices', (req, res) => {
    const { serial_number, os, vendor, device_name, size, cpu, condit, location } = req.body;
    const sql = "INSERT INTO devices (serial_number, os, vendor, device_name, size, cpu, condit, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [serial_number, os, vendor, device_name, size, cpu, condit, location], (err, result) => {
        if (err) {
            console.error('Error inserting into devices:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.json({ success: true, message: 'Device added successfully' });
    });
});

app.delete('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const sql = "DELETE FROM devices WHERE id = ?";
    db.query(sql, deviceId, (err, result) => {
        if (err) {
            console.error('Error deleting device:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        return res.json({ success: true, message: 'Device deleted successfully' });
    });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
