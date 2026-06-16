import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import register from "../assets/register.webp";
import { registerUser } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, mergeCart } from "../redux/slices/cartSlice.js";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useSelector((state) => state.cart);
  const { guestId, user, loading } = useSelector((state) => state.auth);
  const userId = user?._id || null;

  // Get the redirect parameter and check if it's checkout or something else
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  const userCart = async () => {
    console.log(userId);
    console.log(guestId);
    if (!user) return;
    if (user) {
      if (guestId) {
        await dispatch(mergeCart({ guestId }));
        await dispatch(fetchCart({ userId: user._id }));
        // navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
      } else {
        await dispatch(fetchCart({ userId: user._id }));
        // navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
      }
    }
  };
  useEffect(() => {
    const userCart = async () => {
      if (!user) return;
      if (user) {
        if (guestId) {
          console.log(userId);
          console.log(guestId);
          await dispatch(mergeCart({ guestId }));
          await dispatch(fetchCart({ userId: user._id }));
          // navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        } else {
          await dispatch(fetchCart({ userId: user._id }));
          // navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        }
      }
    };
    userCart();
  }, [
    user,
    guestId,
    cart,
    navigate,
    isCheckoutRedirect,
    dispatch,
    redirect,
    userId,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User Registered", { name, email, password });
    dispatch(registerUser({ name, email, password }));
  };
  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Rabbit</h2>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋</h2>
          <p className="text-center mb-6">
            Enter your name, email and password to register
          </p>

          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-semibold mb-2">
              Name
            </label>
            <input
              name="name"
              id="name"
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <input
              name="email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm">
            Have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-500"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={register}
            alt="Login to Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
