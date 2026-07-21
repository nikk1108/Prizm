import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Register: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (res.data.success) {
        setSuccess('Registration successful! Verification email sent. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-text-primary text-center">
          Create a Prizm Account
        </h3>
        <p className="mt-1 text-xs text-text-secondary text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-md text-green-700 dark:text-green-400 text-sm font-medium">
          {success}
          <div className="mt-3 flex justify-end">
            <Link to="/login" className="text-xs font-bold text-accent hover:underline">
              Go to Sign In &rarr;
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
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message as string}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@university.edu"
            error={errors.email?.message as string}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />

          <Input
            label="Password"
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
            Create Account
          </Button>
        </form>
      )}
    </div>
  );
};
export default Register;
