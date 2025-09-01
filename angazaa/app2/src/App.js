import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import QRCode from "react-qr-code";
import DataTable from "react-data-table-component";
import { autoFillDeviceData, validateMacAddress, formatMacAddress } from './deviceDatabase';
import './App.css';

// Fallback BASE_URL if config fails
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

console.log('App.js loaded, BASE_URL:', BASE_URL);

function Tutorial() {
  return (
    <p>
      If the device is operating on Windows, open cmd and type in <b>wmic bios get serialnumber</b>. If the device is operating on MacOS, go to the Apple menu &gt;
      About This Mac. If the device is operating on ChromeOS, press ALT + V on
      the Sign-In screen.
    </p>
  );
}

function Table() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/devices`);
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      } else {
        console.error('Error fetching devices:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching devices:', error.message);
    }
  };

  const deleteDevice = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/devices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDevices(); // Refresh device list after deletion
      } else {
        console.error('Error deleting device:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting device:', error.message);
    }
  };

  const columns = [
    {
      name: "Serial Number",
      selector: row => row.serial_number
    },
    {
      name: "MAC Address",
      selector: row => row.mac_address || "N/A"
    },
    {
      name: "OS",
      selector: row => row.os
    },
    {
      name: "Vendor",
      selector: row => row.vendor
    },
    {
      name: "Device Name",
      selector: row => row.device_name
    },
    {
      name: "Size",
      selector: row => row.size
    },
    {
      name: "CPU",
      selector: row => row.cpu
    },
    {
      name: "Condition",
      selector: row => row.condit
    },
    {
      name: "Location",
      selector: row => row.location
    },
    {
      name: "Actions",
      cell: row => (
        <div className="action-buttons">
          <Link to={`/item/${row.id}`}>View</Link>
          <button onClick={() => deleteDevice(row.id)}>Delete</button>
        </div>
      )
    },
  ];
  
  return (
    <div>
      <Navbar />
      <DataTable columns={columns} data={devices} fixedHeader pagination />
    </div>
  );
}

function Form() {
  let navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      serial_number: "",
      os: "",
      vendor: "",
      device_name: "",
      size: "",
      cpu: "",
      condit: "",
      location: "",
      mac_address: "",
    },
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${BASE_URL}/devices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          navigate("/inven-view");
        } else {
          console.error('Error adding device:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding device:', error.message);
      }
    },
  });

  // Handle serial number change with auto-fill
  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue('serial_number', value);
    
    // Auto-fill if we have a value and it's not being backspaced
    if (value && value.length > 0) {
      const autoData = autoFillDeviceData(value, formik.values.mac_address);
      if (autoData) {
        // Only update vendor and OS if they're empty or if we're adding to the serial
        if (!formik.values.vendor || !formik.values.os || value.length > formik.values.serial_number.length) {
          formik.setFieldValue('vendor', autoData.vendor);
          formik.setFieldValue('os', autoData.os);
        }
      }
    }
  };

  // Handle MAC address formatting and auto-fill
  const handleMacAddressChange = (e) => {
    const formatted = formatMacAddress(e.target.value);
    formik.setFieldValue('mac_address', formatted);
    
    // Auto-fill if we have a value and it's not being backspaced
    if (formatted && formatted.length > 0) {
      const autoData = autoFillDeviceData(formik.values.serial_number, formatted);
      if (autoData) {
        // Only update vendor and OS if they're empty or if we're adding to the MAC
        if (!formik.values.vendor || !formik.values.os || formatted.length > formik.values.mac_address.length) {
          formik.setFieldValue('vendor', autoData.vendor);
          formik.setFieldValue('os', autoData.os);
        }
      }
    }
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={formik.handleSubmit}>
        <h1>Inventory Input Form</h1>
        <div className="details">
          <details>
            <summary>How to find serial code?</summary>
            <Tutorial />
          </details>
        </div>
        <label className="sv" htmlFor="serial_number">
          Serial Number:
          <input
            type="text"
            name="serial_number"
            value={formik.values.serial_number}
            onChange={handleSerialNumberChange}
            placeholder="Enter serial number (e.g., DL123456, MBP13)"
          />
        </label>
        <label className="brand" htmlFor="vendor">
          Vendor:
          <input
            type="text"
            name="vendor"
            value={formik.values.vendor}
            onChange={formik.handleChange}
            placeholder="Auto-filled based on serial/MAC"
            style={{ 
              backgroundColor: formik.values.vendor && (formik.values.serial_number || formik.values.mac_address) ? '#e8f5e8' : 'white' 
            }}
          />
        </label>
        <label className="os" htmlFor="os">
          OS:
          <input
            type="text"
            name="os"
            value={formik.values.os}
            onChange={formik.handleChange}
            placeholder="Auto-filled based on serial/MAC"
            style={{ 
              backgroundColor: formik.values.os && (formik.values.serial_number || formik.values.mac_address) ? '#e8f5e8' : 'white' 
            }}
          />
        </label>
        <label className="device-name" htmlFor="device_name">
          Device Name:
          <input
            type="text"
            name="device_name"
            value={formik.values.device_name}
            onChange={formik.handleChange}
          />
        </label>
        <label className="size" htmlFor="size">
          Size:
          <input
            type="text"
            name="size"
            value={formik.values.size}
            onChange={formik.handleChange}
          />
        </label>
        <label className="cpu" htmlFor="cpu">
          CPU:
          <input
            type="text"
            name="cpu"
            value={formik.values.cpu}
            onChange={formik.handleChange}
          />
        </label>
        <label className="condit" htmlFor="condit">
          Condition:
          <input
            type="text"
            name="condit"
            value={formik.values.condit}
            onChange={formik.handleChange}
          />
        </label>
        <label className="location" htmlFor="location">
          Location:
          <input
            type="text"
            name="location"
            value={formik.values.location}
            onChange={formik.handleChange}
          />
        </label>
        <label className="mac-address" htmlFor="mac_address">
          MAC Address:
          <input
            type="text"
            name="mac_address"
            value={formik.values.mac_address}
            onChange={handleMacAddressChange}
            placeholder="00:11:22:33:44:55"
            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
            title="Please enter a valid MAC address (e.g., 00:11:22:33:44:55)"
          />
          {formik.values.mac_address && !validateMacAddress(formik.values.mac_address) && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              Please enter a valid MAC address format (e.g., 00:11:22:33:44:55)
            </div>
          )}
        </label>
        

        
        <div className="submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

function Navbar() {
  let navigate = useNavigate();

  const changePageA = () => {
    navigate("/inven-input");
  }

  const changePageB = () => {
    navigate("/inven-view");
  }

  const changePageC = () => {
    navigate("/");
  }

  return (
    <nav className="nav-bare">
      <img
        className="logo"
        src="https://cdn.glitch.global/89e6cfdf-775c-47cf-a856-87ee59789939/ballsss.png?v=1709439463539"
        style={{ width: 175, height: 175 }}
        alt="Logo"
        onClick={changePageC}
      />
      <button className="inview" onClick={changePageB}>View Inventory</button>
      <button className="input" onClick={changePageA}>Add device</button>
    </nav>
  );
}

function Home() {
  let navigate = useNavigate();

  const changePageA = () => {
    navigate("/inven-input");
  }

  const changePageB = () => {
    navigate("/inven-view");
  }

  return (
    <div>
      <div className="nav-bar">
        <img src="https://cdn.glitch.global/69973fd0-2612-442a-86f4-4900da5d229f/IMG_0522.jpeg?v=1709446089891" alt="W" width="500" height="150"/>
      </div>
      <div className="buttons">
        <button onClick={changePageA}>Add device</button>
        <button onClick={changePageB}>View Inventory</button>
      </div>
    </div>
  );
}

function ItemDetails() {
  const { id } = useParams();

  const [rowData, setRowData] = useState({});

  useEffect(() => {
    fetchDeviceDetails();
  }, [id]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/devices/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRowData(data);
      } else {
        console.error('Error fetching device details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching device details:', error.message);
    }
  };

  const arrayToCsv = (data) => {
    return Object.values(data).map(val => `"${val}"`).join(',');
  }

  const csv = arrayToCsv(rowData);

  const downloadBlob = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', filename);
    pom.click();
  }

  return (
    <div className="item-details">
      <h2>Item Details</h2>
      <p><strong>Serial Number:</strong> {rowData.serial_number}</p>
      <p><strong>MAC Address:</strong> {rowData.mac_address || "N/A"}</p>
      <p><strong>OS:</strong> {rowData.os}</p>
      <p><strong>Vendor:</strong> {rowData.vendor}</p>
      <p><strong>Device Name:</strong> {rowData.device_name}</p>
      <p><strong>Size:</strong> {rowData.size}</p>
      <p><strong>CPU:</strong> {rowData.cpu}</p>
      <p><strong>Condition:</strong> {rowData.condit}</p>
      <p><strong>Location:</strong> {rowData.location}</p>
      <button onClick={() => downloadBlob(csv, "device_details.csv", "text/csv")}>Download CSV</button>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p><strong>Share via QR Code</strong></p>
        {id && <QRCode value={`http://localhost:3000/item/${id}`} />}
      </div>
    </div>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/inven-input" element={<Form />} />
        <Route path="/inven-view" element={<Table />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
