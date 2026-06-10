import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MyOrdersPage from "./MyOrdersPage";
import { logout, logoutUser } from "../redux/slices/authSlice.js";
import { useEffect } from "react";
import { clearCart } from "../redux/slices/cartSlice.js";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=profile");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout())
    dispatch(clearCart());
    navigate("/login?redirect=profile");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* left section */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {user?.name}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Right section Orders table */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <MyOrdersPage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
