import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setError('Verification token is missing in URL parameters.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          login(res.data.token, res.data.user);
          setStatus('success');
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="text-center space-y-4">
      {status === 'loading' && (
        <div className="space-y-3">
          <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-secondary">Verifying your email address...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="h-10 w-10 bg-success/15 border border-success/30 rounded-full flex items-center justify-center mx-auto text-success font-bold text-lg">
            ✓
          </div>
          <h3 className="text-lg font-bold text-text-primary">Email Verified!</h3>
          <p className="text-xs text-text-secondary">
            Your account is now activated. Welcome to the Prizm community!
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/feed')} className="w-full">
              Enter Workspace Feed
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="h-10 w-10 bg-danger/15 border border-danger/30 rounded-full flex items-center justify-center mx-auto text-danger font-bold text-lg">
            ✕
          </div>
          <h3 className="text-lg font-bold text-text-primary">Verification Failed</h3>
          <p className="text-xs text-text-secondary">{error}</p>
          <div className="pt-2">
            <Link to="/login" className="text-xs font-semibold text-accent hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
export default VerifyEmail;
