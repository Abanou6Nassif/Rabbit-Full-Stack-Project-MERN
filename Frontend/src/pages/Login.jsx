import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { loginUser } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, mergeCart } from "../redux/slices/cartSlice.js";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DOMPurify from "dompurify";
import { toast, Toaster } from "sonner";

export const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
export const passErrorMsg =
  "Minimum eight characters, at least one upper case English letter, one lower case English letter, one number and one special character";

const schema = yup.object({
  email: yup
    .string()
    .email("Must be a valid email")
    .required()
    .matches(emailRegex),
  password: yup.string().min(8, "must be at least 8 characters long"),
  // .matches(passwordRegex, passErrorMsg),
});

function Login() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useSelector((state) => state.cart);
  const {
    guestId,
    user,
    loading,
    error: authErrors,
  } = useSelector((state) => state.auth);
  const userId = user?._id || null;

  // Get the redirect parameter and check if it's checkout or something else
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    const userCart = async () => {
      if (!user) return;

      if (user) {
        if (guestId) {
          console.log(guestId);
          console.log(userId);

          await dispatch(mergeCart({ guestId }));
          await dispatch(fetchCart({ userId: user._id }));
          navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        } else {
          await dispatch(fetchCart({ userId: user._id }));
          navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        }
      }
    };

    console.log(user);

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

  const submitForm = async (data) => {
    const email = DOMPurify.sanitize(data.email);
    const password = DOMPurify.sanitize(data.password);
    if (email !== data.email || password !== data.password) {
      toast.error("Invalid characters detected in input!", {
        position: "top-center",
        style: {
          border: "1px solid #ff4d4f",
          padding: "16px",
          color: "#ff4d4f",
          background: "#fff1f0",
        },
        icon: "⚠️",
      });
      return;
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit(submitForm)}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Rabbit</h2>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋</h2>
          <p className="text-center mb-6">
            Enter your email and password to login
          </p>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <input
              {...register("email")}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
            />
            <p className="text-red-500 p-1">{errors.email?.message}</p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              {...register("password")}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
            />
            <p className="text-red-500 p-1">{errors.password?.message}</p>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>

          <p className="text-red-500 p-1 text-center">{authErrors}</p>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-500"
            >
              Register
            </Link>
          </p>
        </form>

        {/* Toaster */}
        <Toaster />
      </div>
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={login}
            alt="Login to Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
