// import React from "react";
// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const { user } = useSelector((state) => state.auth);

//   if (!user) {
//     return <Navigate to="/" replace />; // redirect to login if not logged in
//   }

//   return children;
// };

// export default ProtectedRoute;

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" replace />; // redirect to login if not logged in
  }

  return children;
};

export default ProtectedRoute;

