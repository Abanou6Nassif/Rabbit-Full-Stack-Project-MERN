import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import login from "../assets/login.webp";
import { resetPassword } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DOMPurify from "dompurify";
import { Toaster } from "sonner";
import {
  passErrorMsg,
  passwordRegex,
  toastError,
  toastSuccess,
} from "./constants/shared.js";

const schema = yup.object({
  password: yup
    .string()
    .required("Password is a required field")
    .min(8, "Must be at least 8 characters long")
    .matches(passwordRegex, passErrorMsg),
  confirmPassword: yup
    .string()
    .required("Confirm password is a required field")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

function ResetPassword() {
  const {
    register,
    formState: { errors, dirtyFields, isValid },
    handleSubmit,
    watch,
  } = useForm({
    mode: "all",
    resolver: yupResolver(schema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading } = useSelector((state) => state.auth);

  const submitForm = async (data) => {
    const password = DOMPurify.sanitize(data.password);
    const confirmPassword = DOMPurify.sanitize(data.confirmPassword);

    if (password !== data.password || confirmPassword !== data.confirmPassword) {
      toastError("Invalid characters detected in input!");
      return;
    }

    try {
      await dispatch(
        resetPassword({ token, password, confirmPassword }),
      ).unwrap();
      toastSuccess("Password reset successfully");
      navigate("/login");
    } catch (error) {
      toastError(
        typeof error === "string" ? error : error?.message || "Reset failed",
      );
    }
  };

  const passwordValue = watch("password");

  useEffect(() => {
    if (!token) {
      toastError("Reset token is missing");
    }
  }, [token]);

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

          <h2 className="text-2xl font-bold text-center mb-6">Set a new password</h2>
          <p className="text-center mb-6">
            Choose a strong password and confirm it to finish resetting your account.
          </p>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              New password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-2 border rounded ${dirtyFields.password ? "bg-yellow-50" : ""}
              ${isValid && passwordValue ? "border-green-500" : ""}
              ${errors.password ? "border-red-500" : ""}
              `}
              placeholder="Enter your new password"
            />
            {errors.password && (
              <p className="text-red-500 p-1 text-sm">
                {errors.password?.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-2"
            >
              Confirm password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full p-2 border rounded ${dirtyFields.confirmPassword ? "bg-yellow-50" : ""}
              ${isValid && passwordValue ? "border-green-500" : ""}
              ${errors.confirmPassword ? "border-red-500" : ""}
              `}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 p-1 text-sm">
                {errors.confirmPassword?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>

          <p className="mt-6 text-center text-sm">
            Back to login? <Link to="/login" className="text-blue-500">Login</Link>
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

export default ResetPassword;