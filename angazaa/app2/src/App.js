import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import QRCode from "react-qr-code";
import DataTable from "react-data-table-component";
import { autoFillDeviceData, validateMacAddress, formatMacAddress } from './deviceDatabase';
import './App.css';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

// Tutorial component
function Tutorial() {
  return (
    <p>
      Windows: <b>wmic bios get serialnumber</b> | MacOS: Apple menu &gt; About This Mac | ChromeOS: ALT+V on Sign-In
    </p>
  );
}

// Navbar
function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="nav-bar">
      <img
        src="https://cdn.glitch.global/89e6cfdf-775c-47cf-a856-87ee59789939/ballsss.png?v=1709439463539"
        alt="Logo"
        className="logo"
        onClick={() => navigate("/")}
      />
      <div className="nav-buttons">
        <button onClick={() => navigate("/inven-view")}>View Inventory</button>
        <button onClick={() => navigate("/inven-input")}>Add Device</button>
      </div>
    </nav>
  );
}

// Home Page
function Home() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <img
        src="https://cdn.glitch.global/69973fd0-2612-442a-86f4-4900da5d229f/IMG_0522.jpeg?v=1709446089891"
        alt="Logo"
        className="home-banner"
      />
      <div className="home-buttons">
        <button onClick={() => navigate("/inven-input")}>Add Device</button>
        <button onClick={() => navigate("/inven-view")}>View Inventory</button>
      </div>
    </div>
  );
}

// Form Page
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
      } catch (e) { console.error(e); }
    },
  });

  const handleSerialChange = e => {
    const val = e.target.value;
    formik.setFieldValue('serial_number', val);
    if (val) {
      const auto = autoFillDeviceData(val, formik.values.mac_address);
      if (auto) {
        if (!formik.values.vendor || !formik.values.os || val.length > formik.values.serial_number.length) {
          formik.setFieldValue('vendor', auto.vendor);
          formik.setFieldValue('os', auto.os);
        }
      }
    }
  };

  const handleMacChange = e => {
    const val = formatMacAddress(e.target.value);
    formik.setFieldValue('mac_address', val);
    if (val) {
      const auto = autoFillDeviceData(formik.values.serial_number, val);
      if (auto) {
        if (!formik.values.vendor || !formik.values.os || val.length > formik.values.mac_address.length) {
          formik.setFieldValue('vendor', auto.vendor);
          formik.setFieldValue('os', auto.os);
        }
      }
    }
  };

  return (
    <div className="container">
      <Navbar />
      <form className="form-container" onSubmit={formik.handleSubmit}>
        <h1>Inventory Input Form</h1>
        <details className="tutorial">
          <summary>How to find serial code?</summary>
          <Tutorial />
        </details>

        {/** Inputs */}
        <label>Serial Number:
          <input type="text" name="serial_number" value={formik.values.serial_number} onChange={handleSerialChange} placeholder="DL123456, MBP13"/>
        </label>

        <label>Vendor:
          <input type="text" name="vendor" value={formik.values.vendor} onChange={formik.handleChange} placeholder="Auto-filled" style={{backgroundColor: formik.values.vendor ? '#e8f5e8' : 'white'}}/>
        </label>

        <label>OS:
          <input type="text" name="os" value={formik.values.os} onChange={formik.handleChange} placeholder="Auto-filled" style={{backgroundColor: formik.values.os ? '#e8f5e8' : 'white'}}/>
        </label>

        <label>Device Name:<input type="text" name="device_name" value={formik.values.device_name} onChange={formik.handleChange}/></label>
        <label>Size:<input type="text" name="size" value={formik.values.size} onChange={formik.handleChange}/></label>
        <label>CPU:<input type="text" name="cpu" value={formik.values.cpu} onChange={formik.handleChange}/></label>
        <label>Condition:<input type="text" name="condit" value={formik.values.condit} onChange={formik.handleChange}/></label>
        <label>Location:<input type="text" name="location" value={formik.values.location} onChange={formik.handleChange}/></label>
        <label>MAC Address:
          <input type="text" name="mac_address" value={formik.values.mac_address} onChange={handleMacChange} placeholder="00:11:22:33:44:55" pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"/>
          {formik.values.mac_address && !validateMacAddress(formik.values.mac_address) &&
            <div className="error-msg">Invalid MAC format</div>}
        </label>

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
}

// Table Page
function Table() {
  const [devices, setDevices] = useState([]);

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${BASE_URL}/devices`);
      if (res.ok) setDevices(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDevices(); }, []);

  const deleteDevice = async id => {
    try {
      const res = await fetch(`${BASE_URL}/devices/${id}`, {method:'DELETE'});
      if(res.ok) fetchDevices();
    } catch(e){console.error(e);}
  };

  const downloadTableCSV = () => {
    if(devices.length === 0) return;
    const headers = Object.keys(devices[0]);
    const csv = [headers.join(',')].concat(devices.map(d=>headers.map(h=>`"${d[h]}"`).join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='inventory.csv'; a.click();
  };

  const columns = [
    {name:'Serial', selector: r=>r.serial_number},
    {name:'MAC', selector:r=>r.mac_address || 'N/A'},
    {name:'OS', selector:r=>r.os},
    {name:'Vendor', selector:r=>r.vendor},
    {name:'Device', selector:r=>r.device_name},
    {name:'Size', selector:r=>r.size},
    {name:'CPU', selector:r=>r.cpu},
    {name:'Condition', selector:r=>r.condit},
    {name:'Location', selector:r=>r.location},
    {
      name:'Actions', cell: row => (
        <div className="action-buttons">
          <Link to={`/item/${row.id}`} className="action-view">View</Link>
          <button onClick={()=>deleteDevice(row.id)} className="action-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="container">
      <Navbar />
      <div className="table-header">
        <h2>Inventory</h2>
        <button className="download-btn" onClick={downloadTableCSV}>Download Full CSV</button>
      </div>
      <DataTable columns={columns} data={devices} fixedHeader pagination highlightOnHover/>
    </div>
  );
}

// Item Details Page
function ItemDetails() {
  const { id } = useParams();
  const [data, setData] = useState({});

  useEffect(()=>{
    const fetchData = async()=>{
      try{
        const res = await fetch(`${BASE_URL}/devices/${id}`);
        if(res.ok) setData(await res.json());
      }catch(e){console.error(e);}
    };
    fetchData();
  }, [id]);

  const downloadCSV = () => {
    const headers = Object.keys(data);
    const csv = headers.map(h=>`"${h}"`).join(',') + '\n' + headers.map(h=>`"${data[h]}"`).join(',');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='item.csv'; a.click();
  };

  return (
    <div className="container">
      <Navbar />
      <div className="item-card">
        <h2>Item Details</h2>
        {Object.entries(data).map(([key,val])=>
         <p key={key}><strong>{key.replace('_', ' ')}:</strong> {val || 'N/A'}</p>
        )}
        <div className="item-actions">
          <button onClick={downloadCSV}>Download CSV</button>
        </div>
        {id && (
          <div className="qr-code">
            <p><strong>Share via QR Code</strong></p>
            <QRCode value={`http://localhost:3000/item/${id}`} />
          </div>
        )}
      </div>
    </div>
  );
}

// Main App
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
