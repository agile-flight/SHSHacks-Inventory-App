// Configuration for different environments
const config = {
  development: {
    BASE_URL: "http://localhost:5050"
  },
  production: {
    BASE_URL: process.env.REACT_APP_API_URL || "https://your-backend-url.com"
  }
};

const environment = process.env.NODE_ENV || 'development';
export const BASE_URL = config[environment].BASE_URL;
