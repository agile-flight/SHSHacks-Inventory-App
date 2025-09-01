import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import QRCode from "react-qr-code";
import DataTable from "react-data-table-component";
import { autoFillDeviceData, validateMacAddress, formatMacAddress } from './deviceDatabase';
import './App.css';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function Tutorial() {
  return (
    <p>
      If the device is operating on Windows, open cmd and type in <b>wmic bios get serialnumber</b>. 
      If MacOS, go to Apple menu &gt; About This Mac. 
      If ChromeOS, press ALT + V on the Sign-In screen.
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

  const downloadAllDevicesCSV = () => {
    if (!devices || devices.length === 0) return;

    const headers = Object.keys(devices[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    devices.forEach(device => {
      const values = headers.map(header => `"${device[header] ?? ''}"`);
      csvRows.push(values.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_devices.csv';
    a.click();
  };

  const columns = [
    { name: "Serial Number", selector: row => row.serial_number, sortable: true },
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
          <Link className="table-btn" to={`/item/${row.id}`}>View</Link>
          <button className="table-btn delete" onClick={() => deleteDevice(row.id)}>Delete</button>
        </div>
      )
    },
  ];

  return (
    <div className="table-page">
      <Navbar />
      <div className="table-header">
        <h2>Inventory</h2>
        <button className="download-btn" onClick={downloadAllDevicesCSV}>Download CSV</button>
      </div>
      <DataTable columns={columns} data={devices} fixedHeader pagination highlightOnHover />
    </div>
  );
}

function Form() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      serial_number: "", os: "", vendor: "", device_name: "", size: "", cpu: "",
      condit: "", location: "", mac_address: "",
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
      } catch (error) { console.error('Error adding device:', error.message); }
    },
  });

  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue('serial_number', value);
    if (value.length > 0) {
      const autoData = autoFillDeviceData(value, formik.values.mac_address);
      if (autoData && (!formik.values.vendor || !formik.values.os || value.length > formik.values.serial_number.length)) {
        formik.setFieldValue('vendor', autoData.vendor);
        formik.setFieldValue('os', autoData.os);
      }
    }
  };

  const handleMacAddressChange = (e) => {
    const formatted = formatMacAddress(e.target.value);
    formik.setFieldValue('mac_address', formatted);
    if (formatted.length > 0) {
      const autoData = autoFillDeviceData(formik.values.serial_number, formatted);
      if (autoData && (!formik.values.vendor || !formik.values.os || formatted.length > formik.values.mac_address.length)) {
        formik.setFieldValue('vendor', autoData.vendor);
        formik.setFieldValue('os', autoData.os);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={formik.handleSubmit}>
        <h1>Inventory Input Form</h1>
        <div className="details">
          <details><summary>How to find serial code?</summary><Tutorial /></details>
        </div>

        <label className="sv">Serial Number:
          <input type="text" name="serial_number" value={formik.values.serial_number} onChange={handleSerialNumberChange} placeholder="DL123456, MBP13" />
        </label>
        <label className="brand">Vendor:
          <input type="text" name="vendor" value={formik.values.vendor} onChange={formik.handleChange} placeholder="Auto-filled" style={{ backgroundColor: formik.values.vendor ? '#e8f5e8' : 'white' }} />
        </label>
        <label className="os">OS:
          <input type="text" name="os" value={formik.values.os} onChange={formik.handleChange} placeholder="Auto-filled" style={{ backgroundColor: formik.values.os ? '#e8f5e8' : 'white' }} />
        </label>
        <label className="device-name">Device Name:
          <input type="text" name="device_name" value={formik.values.device_name} onChange={formik.handleChange} />
        </label>
        <label className="size">Size:
          <input type="text" name="size" value={formik.values.size} onChange={formik.handleChange} />
        </label>
        <label className="cpu">CPU:
          <input type="text" name="cpu" value={formik.values.cpu} onChange={formik.handleChange} />
        </label>
        <label className="condit">Condition:
          <input type="text" name="condit" value={formik.values.condit} onChange={formik.handleChange} />
        </label>
        <label className="location">Location:
          <input type="text" name="location" value={formik.values.location} onChange={formik.handleChange} />
        </label>
        <label className="mac-address">MAC Address:
          <input type="text" name="mac_address" value={formik.values.mac_address} onChange={handleMacAddressChange} placeholder="00:11:22:33:44:55" pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$" title="Valid MAC (00:11:22:33:44:55)" />
          {formik.values.mac_address && !validateMacAddress(formik.values.mac_address) &&
            <div className="error-text">Please enter a valid MAC address.</div>
          }
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
      <img className="logo" src="https://cdn.glitch.global/89e6cfdf-775c-47cf-a856-87ee59789939/ballsss.png?v=1709439463539" style={{ width: 175, height: 175 }} alt="Logo" onClick={() => navigate("/")} />
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
        <img src="https://cdn.glitch.global/69973fd0-2612-442a-86f4-4900da5d229f/IMG_0522.jpeg?v=1709446089891" alt="W" width="500" height="150"/>
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

  useEffect(() => { fetchDeviceDetails(); }, [id]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/devices/${id}`);
      if (response.ok) setRowData(await response.json());
    } catch (error) { console.error(error); }
  };

  const downloadBlob = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const csv = Object.values(rowData).map(val => `"${val}"`).join(',');

  return (
    <div className="item-details">
      <h2>Item Details</h2>
      {Object.entries(rowData).map(([key, val]) => <p key={key}><strong>{key.replace('_',' ')}:</strong> {val || "N/A"}</p>)}
      <button onClick={() => downloadBlob(csv, "device_details.csv")}>Download CSV</button>
      <div className="qr-code">
        {id && <QRCode value={`http://localhost:3000/item/${id}`} />}
      </div>
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
