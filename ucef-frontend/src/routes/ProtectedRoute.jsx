// PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("adminToken"); // or your auth check
  return isAdmin ? children : <Navigate to="/admin/login" />;
}
