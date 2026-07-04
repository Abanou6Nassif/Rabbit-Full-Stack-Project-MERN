import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../redux/slices/authSlice.js";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) return;

    const runVerification = async () => {
      try {
        await dispatch(verifyEmail({ token })).unwrap();
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    };

    runVerification();
  }, [dispatch, navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-3">Email verification</h1>
        <p className="text-gray-600">
          {loading
            ? "Verifying your email address..."
            : error || "Your email has been verified."}
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;