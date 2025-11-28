// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import Navbar from '../components/Navbar';
// import { signup } from '../services/authService';
// import { loginSuccess } from '../store/slices/authSlice';

// const Signup = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     contact: '',
//     password: '',
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.username || !formData.email || !formData.password) {
//       alert('Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await signup(formData);
//       dispatch(loginSuccess(data));
//       localStorage.setItem('token', data.token);
//       navigate('/dashboard');
//     } catch (err) {
//       alert(err.message || 'Signup failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="container mt-5" style={{ maxWidth: '450px' }}>
//         <h2 className="mb-4 text-center">Sign Up</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="username"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//               placeholder="Enter your username"
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="email" className="form-label">
//               Email
//             </label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               placeholder="Enter your email"
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="contact" className="form-label">
//               Contact Number
//             </label>
//             <input
//               type="tel"
//               className="form-control"
//               id="contact"
//               name="contact"
//               value={formData.contact}
//               onChange={handleChange}
//               placeholder="Optional"
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               type="password"
//               className="form-control"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               placeholder="Enter your password"
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? 'Signing Up...' : 'Sign Up'}
//           </button>
//         </form>

//         <div className="mt-3 text-center">
//           Already have an account? <Link to="/">Login</Link>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Signup;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
    
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: "450px" }}>
        <h2 className="mb-4 text-center">Sign Up</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="contact" className="form-label">
              Contact Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter your contact number"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-3">OR</div>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <a
            href="http://localhost:5000/auth/google"
            className="btn btn-outline-danger flex-grow-1"
          >
            Google
          </a>
          <a
            href="http://localhost:5000/auth/facebook"
            className="btn btn-outline-primary flex-grow-1"
          >
            Facebook
          </a>
        </div>

        <div className="mt-3 text-center">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
