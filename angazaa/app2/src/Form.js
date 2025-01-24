import { useFormik } from "formik";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import './App.css';


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
              onChange={formik.handleChange}
            />
          </label>
          <label className="brand" htmlFor="vendor">
            Vendor:
            <input
              type="text"
              name="vendor"
              value={formik.values.vendor}
              onChange={formik.handleChange}
            />
          </label>
          <label className="os" htmlFor="os">
            OS:
            <input
              type="text"
              name="os"
              value={formik.values.os}
              onChange={formik.handleChange}
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
          <div className="submit">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    );
  } 
  export default Form;