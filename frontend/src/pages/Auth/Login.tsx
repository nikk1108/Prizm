import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSessionExpired = searchParams.get('expired') === 'true';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/feed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center">
        <h3 className="text-xl font-bold text-text-primary">
          Sign in to Prizm
        </h3>
        <p className="mt-1.5 text-xs text-text-secondary">
          Welcome back. Enter your credentials to access your workspace.
        </p>
      </div>

      {isSessionExpired && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded text-warning text-xs font-medium text-center">
          Your session expired. Please sign in again.
        </div>
      )}

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => alert('GitHub authentication is mock-active in development.')}
          className="flex items-center justify-center space-x-2 py-2 px-3 border border-border rounded-lg bg-card text-text-primary text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Google authentication is mock-active in development.')}
          className="flex items-center justify-center space-x-2 py-2 px-3 border border-border rounded-lg bg-card text-text-primary text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98.75 12 .75 7.24.75 3.17 3.44 1.15 7.37l3.86 3C5.93 7.57 8.7 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.49z"/>
            <path fill="#FBBC05" d="M5.01 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37V6.63H1.15C.42 8.09 0 9.74 0 12s.42 3.91 1.15 5.37l3.86-3z"/>
            <path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.3 0-6.07-2.53-7.07-5.33l-3.86 3c2.02 3.93 6.09 6.62 10.83 6.62z"/>
          </svg>
          <span>Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-3 text-[10px] uppercase font-semibold tracking-wider text-text-secondary">
          or continue with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          error={errors.email?.message as string}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-xs bg-card text-text-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors ${
              errors.password ? 'border-danger' : 'border-border'
            }`}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          {errors.password && (
            <span className="text-xs text-danger font-medium mt-1 block animate-in fade-in duration-100">
              {errors.password.message as string}
            </span>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent h-3.5 w-3.5"
          />
          <label htmlFor="remember-me" className="ml-2 text-xs text-text-secondary select-none cursor-pointer">
            Remember my session
          </label>
        </div>

        <Button type="submit" className="w-full text-xs py-2 font-semibold" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="border-t border-border/80 pt-4 text-center">
        <p className="text-xs text-text-secondary">
          New to Prizm?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
