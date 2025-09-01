import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import QRCode from "react-qr-code";
import DataTable from "react-data-table-component";
import { autoFillDeviceData, validateMacAddress, formatMacAddress } from './deviceDatabase';
import './App.css';

// Fallback BASE_URL if config fails
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function Tutorial() {
  return (
    <p>
      If the device is operating on Windows, open cmd and type <b>wmic bios get serialnumber</b>.
      On MacOS, go to the Apple menu &gt; About This Mac.
      On ChromeOS, press ALT + V on the Sign-In screen.
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
      const response = await fetch(`${BASE_URL}/devices/${id}`, { method: 'DELETE' });
      if (response.ok) fetchDevices();
      else console.error('Error deleting device:', response.statusText);
    } catch (error) {
      console.error('Error deleting device:', error.message);
    }
  };

  const columns = [
    { name: "Serial Number", selector: row => row.serial_number },
    { name: "MAC Address", selector: row => row.mac_address || "N/A" },
    { name: "OS", selector: row => row.os },
    { name: "Vendor", selector: row => row.vendor },
    { name: "Device Name", selector: row => row.device_name },
    { name: "Size", selector: row => row.size },
    { name: "CPU", selector: row => row.cpu },
    { name: "Condition", selector: row => row.condit },
    { name: "Location", selector: row => row.location },
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
      <div className="data-table-container">
        <DataTable
          columns={columns}
          data={devices}
          fixedHeader
          pagination
          highlightOnHover
        />
      </div>
    </div>
  );
}

function Form() {
  const navigate = useNavigate();

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (response.ok) navigate("/inven-view");
        else console.error('Error adding device:', response.statusText);
      } catch (error) {
        console.error('Error adding device:', error.message);
      }
    },
  });

  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue('serial_number', value);
    if (value) {
      const autoData = autoFillDeviceData(value, formik.values.mac_address);
      if (autoData) {
        if (!formik.values.vendor || !formik.values.os || value.length > formik.values.serial_number.length) {
          formik.setFieldValue('vendor', autoData.vendor);
          formik.setFieldValue('os', autoData.os);
        }
      }
    }
  };

  const handleMacAddressChange = (e) => {
    const formatted = formatMacAddress(e.target.value);
    formik.setFieldValue('mac_address', formatted);
    if (formatted) {
      const autoData = autoFillDeviceData(formik.values.serial_number, formatted);
      if (autoData) {
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
        <label className="sv">
          Serial Number:
          <input type="text" name="serial_number" value={formik.values.serial_number} onChange={handleSerialNumberChange} placeholder="e.g., DL123456" />
        </label>
        <label className="brand">
          Vendor:
          <input type="text" name="vendor" value={formik.values.vendor} onChange={formik.handleChange} placeholder="Auto-filled" />
        </label>
        <label className="os">
          OS:
          <input type="text" name="os" value={formik.values.os} onChange={formik.handleChange} placeholder="Auto-filled" />
        </label>
        <label className="device-name">
          Device Name:
          <input type="text" name="device_name" value={formik.values.device_name} onChange={formik.handleChange} />
        </label>
        <label className="size">
          Size:
          <input type="text" name="size" value={formik.values.size} onChange={formik.handleChange} />
        </label>
        <label className="cpu">
          CPU:
          <input type="text" name="cpu" value={formik.values.cpu} onChange={formik.handleChange} />
        </label>
        <label className="condit">
          Condition:
          <input type="text" name="condit" value={formik.values.condit} onChange={formik.handleChange} />
        </label>
        <label className="location">
          Location:
          <input type="text" name="location" value={formik.values.location} onChange={formik.handleChange} />
        </label>
        <label className="mac-address">
          MAC Address:
          <input type="text" name="mac_address" value={formik.values.mac_address} onChange={handleMacAddressChange} placeholder="00:11:22:33:44:55" pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$" title="Valid MAC address" />
          {formik.values.mac_address && !validateMacAddress(formik.values.mac_address) && (
            <div className="error-msg">Please enter a valid MAC address.</div>
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
  const navigate = useNavigate();
  return (
    <nav className="nav-bare">
      <img className="logo" src="https://cdn.glitch.global/89e6cfdf-775c-47cf-a856-87ee59789939/ballsss.png?v=1709439463539" alt="Logo" onClick={() => navigate("/")} />
      <button className="inview" onClick={() => navigate("/inven-view")}>View Inventory</button>
      <button className="input" onClick={() => navigate("/inven-input")}>Add device</button>
    </nav>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="nav-bar">
        <img src="https://cdn.glitch.global/69973fd0-2612-442a-86f4-4900da5d229f/IMG_0522.jpeg?v=1709446089891" alt="Home" width="500" height="150" />
      </div>
      <div className="buttons">
        <button onClick={() => navigate("/inven-input")}>Add device</button>
        <button onClick={() => navigate("/inven-view")}>View Inventory</button>
      </div>
    </div>
  );
}

function ItemDetails() {
  const { id } = useParams();
  const [rowData, setRowData] = useState({});

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/devices/${id}`);
        if (response.ok) setRowData(await response.json());
      } catch (error) {
        console.error('Error fetching device details:', error.message);
      }
    };
    fetchDeviceDetails();
  }, [id]);

  const downloadCSV = () => {
    const csv = Object.values(rowData).map(val => `"${val}"`).join(',');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'device_details.csv');
    a.click();
  }

  return (
    <div className="item-details">
      <h2>Item Details</h2>
      {Object.entries(rowData).map(([key, value]) => <p key={key}><strong>{key.replace('_',' ')}:</strong> {value || "N/A"}</p>)}
      <button onClick={downloadCSV}>Download CSV</button>
      {id && <div className="qr-container"><QRCode value={`http://localhost:3000/item/${id}`} /></div>}
    </div>
  );
}

function App() {
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
