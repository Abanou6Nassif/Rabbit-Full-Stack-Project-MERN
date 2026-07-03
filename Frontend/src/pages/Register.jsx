import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import registerImg from "../assets/register.webp";
import { registerUser } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, mergeCart } from "../redux/slices/cartSlice.js";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DOMPurify from "dompurify";
import { Toaster } from "sonner";
import {
  emailRegex,
  passErrorMsg,
  passwordRegex,
  nameRegex,
  toastSuccess,
  toastError,
} from "./constants/shared.js";

/**
 * The order in yup validation is important
 */
const schema = yup.object({
  name: yup
    .string()
    .required("Name is a required field")
    .min(3, "Must be at least 3 charachters long")
    .matches(nameRegex, "Must be a valid name"),
  email: yup
    .string()
    .required("Email is a required field")
    .email("Must be a valid email")
    .matches(emailRegex),
  password: yup
    .string().required('Password is a required field')
    .min(8, "Must be at least 8 characters long")
    .matches(passwordRegex, passErrorMsg),
});

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isValid },
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
  const userId = user?._id || null;

  // Get the redirect parameter and check if it's checkout or something else
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    const userCart = async () => {
      if (!user) return;
      if (user) {
        if (guestId) {
          await dispatch(mergeCart({ guestId }));
          await dispatch(fetchCart({ userId: user._id }));
          navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
        } else {
          await dispatch(fetchCart({ userId: user._id }));
          navigate(isCheckoutRedirect ? "/checkout" : `/${redirect}`);
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

  const submitForm = async (data) => {
    const name = DOMPurify.sanitize(data.name);
    const email = DOMPurify.sanitize(data.email);
    const password = DOMPurify.sanitize(data.password);
    if (
      email !== data.email ||
      password !== data.password ||
      name !== data.name
    ) {
      toastError("Invalid characters detected in input!");
      return;
    } else {
      try {
        await dispatch(registerUser({ name, email, password })).unwrap();
        toastSuccess("Registered successfully");
      } catch (error) {
        toastError(
          typeof error === "string" ? error : error?.message || "Registration failed",
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
            Enter your name, email and password to register
          </p>

          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full p-2 border rounded ${dirtyFields.name ? "bg-yellow-50" : ""}
              ${isValid ? "border-green-500" : ""}
              ${errors.name ? "border-red-500" : ""}
              `}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 p-1 text-sm">{errors.name?.message}</p>
            )}
          </div>

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
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="text-red-500 p-1 text-center">{authErrors}</p>

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
        <Toaster />
      </div>
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={registerImg}
            alt="Login to Account"
            className="h-187.5 w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
