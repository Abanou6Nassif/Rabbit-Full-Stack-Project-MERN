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
import { Toaster } from "sonner";
import { toastError, toastSuccess } from "./constants/shared.js";
import { emailRegex } from "./constants/shared.js";
import { useRef } from "react";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Must be a valid email")
    .required("Email is a required field")
    .matches(emailRegex, "Must be a valid email"),
  password: yup.string().trim().required("Password is a required field"),
  // .matches(passwordRegex, passErrorMsg),
});

function Login() {
  const {
    register,
    formState: { errors, dirtyFields, isValid },
    handleSubmit,
  } = useForm({
    mode: "all",
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
  const authErrorMessage =
    typeof authErrors === "string" ? authErrors : authErrors?.message || "";
  const userId = user?._id || null;

  // Get the redirect parameter and check if it's checkout or something else
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  const hasMerged = useRef(false);

  useEffect(() => {
    if (!user || hasMerged.current) return;

    const userCart = async () => {
      hasMerged.current = true;
      try {
        if (guestId) {
          const mergedCart = await dispatch(mergeCart({ guestId })).unwrap();
          console.log(mergedCart);
        }
        const usercart = await dispatch(
          fetchCart({ userId: user._id }),
        ).unwrap();
        console.log(usercart);

        navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        hasMerged.current = true; // allow retry on failure
      }
    };

    userCart();
  }, [user, guestId, navigate, isCheckoutRedirect, dispatch, redirect, userId]);

  const submitForm = async (data) => {
    const email = DOMPurify.sanitize(data.email);
    const password = DOMPurify.sanitize(data.password);
    if (email !== data.email || password !== data.password) {
      toastError("Invalid characters detected in input!");
      return;
    } else {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
        toastSuccess("Logged in successfully");
      } catch (error) {
        toastError(
          typeof error === "string" ? error : error?.message || "Log in failed",
        );
      }
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
              type="email"
              {...register("email")}
              className={`w-full p-2 border rounded ${dirtyFields.email ? "bg-yellow-50" : ""}
              ${isValid ? "border-green-500" : ""}
              ${errors.email ? "border-red-500" : ""}
              `}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 p-1 text-sm">
                {errors.email?.message}
              </p>
            )}
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
              {...register("password")}
              className={`w-full p-2 border rounded ${dirtyFields.password ? "bg-yellow-50" : ""}
              ${isValid ? "border-green-500" : ""}
              ${errors.password ? "border-red-500" : ""}
              `}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 p-1 text-sm">
                {errors.password?.message}
              </p>
            )}{" "}
            <div className="mt-2 text-right">
              <Link
                to={`/forgot-password?redirect=${encodeURIComponent(redirect)}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>

          {authErrorMessage ? (
            <p className="text-red-500 p-1 text-center">{authErrorMessage}</p>
          ) : null}

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
            className="h-187.5 w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
