-- Database setup script for Angaaza Inventory Management System

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS inventory_system;
-- USE inventory_system;

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL,
    os VARCHAR(50),
    vendor VARCHAR(50),
    device_name VARCHAR(100),
    size VARCHAR(20),
    cpu VARCHAR(50),
    condit VARCHAR(20),
    location VARCHAR(100),
    mac_address VARCHAR(17),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add some sample data (optional)
INSERT INTO devices (serial_number, os, vendor, device_name, size, cpu, condit, location, mac_address) VALUES
('SN001', 'Windows 11', 'Dell', 'Latitude 5520', '15.6"', 'Intel i7', 'Good', 'Room 101', '00:1B:44:11:3A:B7'),
('SN002', 'macOS', 'Apple', 'MacBook Pro', '13"', 'M1 Chip', 'Excellent', 'Room 102', '00:1B:44:11:3A:B8'),
('SN003', 'ChromeOS', 'HP', 'Chromebook', '14"', 'Intel Celeron', 'Fair', 'Room 103', '00:1B:44:11:3A:B9');
