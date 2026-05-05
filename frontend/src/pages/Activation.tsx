import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader, CheckCircle, XCircle, Mail } from "lucide-react";
import { activateAccount, resendActivation } from "../api";

const Activation: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const activated = useRef(false);

  useEffect(() => {
    if (activated.current) return;
    activated.current = true;

    const activate = async () => {
      if (!uid || !token) {
        setStatus("error");
        setMessage("Invalid activation link.");
        return;
      }

      try {
        await activateAccount(uid, token);
        setStatus("success");
        setMessage("Account activated successfully! Please log in with your credentials.");
      } catch (err: any) {
        const data = err.response?.data;
        if (err.response?.status === 403) {
          setStatus("success");
          setMessage("Account is already active! Please log in with your credentials.");
          return;
        }
        if (typeof data === "object") {
          setMessage(Object.values(data).flat().join(" ") || "Activation failed.");
        } else {
          setMessage("Activation failed. The link may have expired.");
        }
        setStatus("error");
      }
    };

    activate();
  }, [uid, token, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError("");
    setResendSuccess(false);
    setResending(true);

    try {
      await resendActivation(resendEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.response?.data?.detail || "Failed to resend activation email.");
    } finally {
      setResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activating Account</h2>
          <p className="text-gray-600">Please wait while we activate your account...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request a new activation link</h3>
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-700 text-sm">Activation email sent! Check your inbox.</p>
            </div>
          )}
          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{resendError}</p>
            </div>
          )}
          <form onSubmit={handleResend} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={resending || !resendEmail}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resending ? <Loader className="w-4 h-4 animate-spin" /> : "Resend Activation Email"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Activation;
