import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    if (!token) {
      setError('Password reset token is missing in parameters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password: data.password
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/feed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed. Token might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary">Choose new password</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Enter your new password below to update credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message as string}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Reset Password & Sign In
        </Button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-semibold text-accent hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
export default ResetPassword;
