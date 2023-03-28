import { Navigate } from "react-router-dom";

// TODO: Don't cause flicker
const ProtectedRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
