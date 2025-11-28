// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Helper to get URL params
  const getQueryParams = () => {
    return new URLSearchParams(location.search);
  };

  useEffect(() => {
    const handlePostPayment = async () => {
      const params = getQueryParams();
      const cvId = params.get("cvId");
      const action = params.get("action"); // "download" or "share"

      if (!cvId || !action) {
        alert("Invalid payment data");
        navigate("/");
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;

        const token = localStorage.getItem("token"); // get JWT

        if (action === "download") {
          const response = await axios.get(`${API_URL}/cv/${cvId}/download`, {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const fileBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(fileBlob);
          link.download = `CV_${cvId}.pdf`;
          link.click();
          alert("Payment successful! Your CV is downloading...");
        } else if (action === "share") {
          const { data } = await axios.get(`${API_URL}/cv/${cvId}/share`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          alert(`Payment successful! Share this link: ${data.link}`);
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong after payment.");
      } finally {
        setLoading(false);
        navigate(`/editor/${cvId}`); // redirect back to editor
      }
    };

    handlePostPayment();
  }, []);

  return (
    <div className="container mt-5">
      {loading ? <h3>Processing your payment...</h3> : <h3>Done!</h3>}
    </div>
  );
};

export default PaymentSuccess;
