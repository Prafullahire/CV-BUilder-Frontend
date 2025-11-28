import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Layouts from "./pages/Layouts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SocialLoginSuccess from "./pages/SocialLoginSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";
import EditView from "./pages/EditViewCV";
import ProtectedRoute from "./components/ProtectedRoute";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layouts"
            element={
              <ProtectedRoute>
                <Layouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:cvId"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />

          {/* Public routes */}
          <Route path="/editview/:cvId" element={<EditView />} />
          <Route path="/view/:cvId" element={<EditView />} />
          <Route
            path="/social-login-success"
            element={<SocialLoginSuccess />}
          />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;
