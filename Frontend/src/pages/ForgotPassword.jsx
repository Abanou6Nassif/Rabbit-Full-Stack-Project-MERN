import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { requestPasswordReset } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DOMPurify from "dompurify";
import { Toaster } from "sonner";
import { emailRegex, toastError, toastSuccess } from "./constants/shared.js";

const schema = yup.object({
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is a required field")
    .matches(emailRegex, "Must be a valid email"),
});

function ForgotPassword() {
  const {
    register,
    formState: { errors, dirtyFields, isValid },
    handleSubmit,
  } = useForm({
    mode: "all",
    resolver: yupResolver(schema),
  });

  const [resetUrl, setResetUrl] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const submitForm = async (data) => {
    const email = DOMPurify.sanitize(data.email);

    if (email !== data.email) {
      toastError("Invalid characters detected in input!");
      return;
    }

    try {
      const response = await dispatch(requestPasswordReset({ email })).unwrap();
      toastSuccess(response.message || "Password reset instructions sent");
      setResetUrl(response.resetUrl || "");
      console.log(response);
      
      if (response.resetUrl) {
        navigate(`/reset-password/${response.resetUrl.split("/").pop()}`);
      }
    } catch (error) {
      toastError(
        typeof error === "string" ? error : error?.message || "Request failed",
      );
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

          <h2 className="text-2xl font-bold text-center mb-6">Reset password</h2>
          <p className="text-center mb-6">
            Enter your email and we will send you a link to reset your password.
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

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {resetUrl ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 break-all">
              Local reset link: <a className="underline" href={resetUrl}>{resetUrl}</a>
            </div>
          ) : null}

          <p className="mt-6 text-center text-sm">
            Remembered your password?{" "}
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
            src={login}
            alt="Reset password"
            className="h-187.5 w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;