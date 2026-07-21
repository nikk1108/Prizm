import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) {
        setSuccess('Password reset link sent! Please check your email inbox.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary">Reset your password</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Enter your registered email to receive a password reset link
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-md text-green-700 dark:text-green-400 text-sm font-medium text-center">
          {success}
          <div className="mt-3">
            <Link to="/login" className="text-xs font-semibold text-accent hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@university.edu"
            error={errors.email?.message as string}
            {...register('email', { required: 'Email is required' })}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-semibold text-text-secondary hover:text-text-primary">
              Cancel and go back
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
export default ForgotPassword;
