// Device database for auto-filling device information
const deviceDatabase = {
  // Dell devices
  "Dell": {
    serial_prefixes: ["DL", "DX", "DP", "DELL"],
    mac_prefixes: ["00:1B:44", "00:1B:44"],
    vendor: "Dell",
    os: "Windows 11"
  },
  
  // Apple devices
  "Apple": {
    serial_prefixes: ["MBP", "MBA", "MAC", "MBP13", "MBP14"],
    mac_prefixes: ["00:1B:44", "00:1B:44"],
    vendor: "Apple",
    os: "macOS"
  },
  
  // HP devices
  "HP": {
    serial_prefixes: ["HP", "HE", "HC"],
    mac_prefixes: ["00:1B:44", "00:1B:44"],
    vendor: "HP",
    os: "Windows 11"
  },
  
  // Lenovo devices
  "Lenovo": {
    serial_prefixes: ["LENOVO", "LT", "LTX1", "LTT14"],
    mac_prefixes: ["00:1B:44", "00:1B:44"],
    vendor: "Lenovo",
    os: "Windows 11"
  }
};

// Function to auto-fill device data based on serial number or MAC address
export const autoFillDeviceData = (serialNumber, macAddress) => {
  if (!serialNumber && !macAddress) {
    return null;
  }

  // Try to match by serial number prefix
  if (serialNumber) {
    const serial = serialNumber.toUpperCase();
    for (const [brand, device] of Object.entries(deviceDatabase)) {
      for (const prefix of device.serial_prefixes) {
        if (serial.startsWith(prefix)) {
          return {
            vendor: device.vendor,
            os: device.os
          };
        }
      }
    }
  }

  // Try to match by MAC address prefix
  if (macAddress) {
    const macPrefix = macAddress.substring(0, 8).toUpperCase();
    for (const [brand, device] of Object.entries(deviceDatabase)) {
      for (const prefix of device.mac_prefixes) {
        if (macPrefix === prefix.toUpperCase()) {
          return {
            vendor: device.vendor,
            os: device.os
          };
        }
      }
    }
  }

  return null;
};

// Function to validate MAC address format
export const validateMacAddress = (macAddress) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(macAddress);
};

// Function to format MAC address
export const formatMacAddress = (macAddress) => {
  // Remove all non-alphanumeric characters
  const cleaned = macAddress.replace(/[^0-9A-Fa-f]/g, '');
  
  // Add colons every 2 characters
  if (cleaned.length === 12) {
    return cleaned.match(/.{2}/g).join(':').toUpperCase();
  }
  
  return macAddress;
};
