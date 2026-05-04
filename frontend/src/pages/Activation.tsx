// src/pages/Activation.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { activateAccount } from "../api";

const Activation: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateUserAccount = async () => {
      if (!uid || !token) {
        setStatus('error');
        setMessage('Invalid activation link. Missing parameters.');
        return;
      }

      try {
        await activateAccount(uid, token);
        setStatus('success');
        setMessage('Your account has been successfully activated! You can now log in.');
      } catch (err: any) {
        setStatus('error');
        const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Activation failed. The link may be invalid or expired.';
        setMessage(errorMessage);
      }
    };

    activateUserAccount();
  }, [uid, token]);

  const handleGoToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activating Account</h2>
              <p className="text-gray-600">Please wait while we activate your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activation;