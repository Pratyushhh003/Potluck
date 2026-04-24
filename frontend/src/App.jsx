import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useSocket } from "./hooks/useSocket";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import CookDashboard from "./pages/CookDashboard";
import AddFood from "./pages/AddFood";
import CookVerification from "./pages/CookVerification";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const CookRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "cook" ? children : <Navigate to="/" />;
};

function AppContent() {
  useSocket();
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg)] pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cook/dashboard"
            element={
              <ProtectedRoute>
                <CookRoute>
                  <CookDashboard />
                </CookRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cook/add-food"
            element={
              <ProtectedRoute>
                <CookRoute>
                  <AddFood />
                </CookRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cook/verify"
            element={
              <ProtectedRoute>
                <CookRoute>
                  <CookVerification />
                </CookRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
