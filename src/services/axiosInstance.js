// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:5000/api', // replace with your backend URL
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add JWT token automatically if available
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token'); // assuming you store token after login
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;


import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
