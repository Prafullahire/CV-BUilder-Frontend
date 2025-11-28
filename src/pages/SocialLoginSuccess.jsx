import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SocialLoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // store token
      navigate("/dashboard"); // redirect to dashboard
    } else {
      navigate("/"); // fallback
    }
  }, [location, navigate]);

  return <div>Logging you in...</div>;
};

export default SocialLoginSuccess;
