import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  // CHANGED: also read authChecked so we know whether the initial
  // checkAuth() (dispatched from App.jsx on load) has actually resolved yet.
  const { user, authChecked } = useSelector((state) => state.auth);

  // ADDED: while the very first session check is still in flight, `user`
  // will be null even for a legitimately logged-in visitor (their cookie
  // just hasn't been confirmed yet). Without this guard, every hard refresh
  // of a protected page would briefly bounce the user to /login before the
  // real answer came back.
  if (!authChecked) {
    return null; // or a spinner/loading component if you have one
  }

  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
