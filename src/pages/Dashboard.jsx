// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { getCVs } from "../services/cvService";
import { setAllCVs } from "../store/slices/cvSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cvs = useSelector((state) => state.cv.allCVs);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cardLoading, setCardLoading] = useState({});

  // Fetch CVs from backend
  const fetchCVs = async () => {
    try {
      setLoading(true);
      const data = await getCVs(page);
      if (data.length === 0) setHasMore(false);
      else dispatch(setAllCVs([...cvs, ...data]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
    // eslint-disable-next-line
  }, [page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
          document.documentElement.scrollHeight &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  const handleAdd = () => navigate("/editor"); // New CV editor
  const handleEdit = (cvId) => navigate(`/editor/${cvId}`);

  const handlePaymentAction = async (cvId, action) => {
    try {
      setCardLoading((prev) => ({ ...prev, [cvId + action]: true }));
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      if (action === "download") {
        const { data } = await axios.post(
          `${API_URL}/payment/create-checkout-session`,
          { cvId, action },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.open(data.url, "_blank");
      } else if (action === "share") {
        const { data } = await axios.get(`${API_URL}/cv/${cvId}/share`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(`Payment Successful! Share link: ${data.link}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Payment failed");
    } finally {
      setCardLoading((prev) => ({ ...prev, [cvId + action]: false }));
    }
  };

  if (loading && page === 1) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>My CVs</h2>
          <Button text="Add New CV" onClick={handleAdd} variant="success" />
        </div>

        <div className="row">
          {cvs.map((cv) => (
            <div className="col-md-4 mb-3" key={cv._id}>
              <Card>
                <h5>{cv.basic?.name || "No Name"}</h5>
                <p>{cv.basic?.email || "No Email"}</p>
                <p>{cv.basic?.intro || "No Introduction"}</p>

                <div className="d-flex justify-content-between mt-2">
                  <Button
                    text="Edit"
                    variant="primary"
                    onClick={() => handleEdit(cv._id)}
                    className="me-1"
                  />
                  <Button
                    text={
                      cardLoading[cv._id + "download"]
                        ? "Processing..."
                        : "Download"
                    }
                    variant="success"
                    onClick={() => handlePaymentAction(cv._id, "download")}
                    className="me-1"
                    disabled={cardLoading[cv._id + "download"]}
                  />
                  <Button
                    text={
                      cardLoading[cv._id + "share"] ? "Processing..." : "Share"
                    }
                    variant="secondary"
                    onClick={() => handlePaymentAction(cv._id, "share")}
                    disabled={cardLoading[cv._id + "share"]}
                  />
                </div>
              </Card>
            </div>
          ))}
        </div>

        {loading && <Loader />}
        {!hasMore && (
          <p className="text-center text-secondary mt-3">
            No more CVs to display
          </p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
