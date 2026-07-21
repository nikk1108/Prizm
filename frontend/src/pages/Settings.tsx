import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      university: user?.university || '',
      profession: user?.profession || '',
      skills: user?.skills?.join(', ') || '',
      interests: user?.interests?.join(', ') || '',
      profilePicture: user?.profilePicture || ''
    }
  });

  const onSubmit = async (data: any) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        ...data,
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        interests: data.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        updateUser(res.data.data);
        setSuccess('Profile details successfully updated!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-text-primary">Profile settings</h3>
        <p className="text-xs text-text-secondary">
          Configure your academic details, skills, biography, and professional credentials.
        </p>
      </div>

      <Card className="border border-border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded text-green-700 dark:text-green-400 text-xs font-medium">
              {success}
            </div>
          )}

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
            label="Avatar Image URL (Cloudinary or static)"
            placeholder="https://..."
            error={errors.profilePicture?.message as string}
            {...register('profilePicture')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Profession / Degree"
              placeholder="Postdoc Researcher / Software Architect"
              error={errors.profession?.message as string}
              {...register('profession')}
            />

            <Input
              label="University / Affiliation"
              placeholder="MIT / Harvard University"
              error={errors.university?.message as string}
              {...register('university')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Skills (Comma-separated list)"
              placeholder="rust, typescript, deeplearning"
              error={errors.skills?.message as string}
              {...register('skills')}
            />

            <Input
              label="Interests (Comma-separated list)"
              placeholder="cryptography, physics, finance"
              error={errors.interests?.message as string}
              {...register('interests')}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Biography
            </label>
            <textarea
              placeholder="Brief professional intro..."
              rows={4}
              className="w-full p-3 text-sm bg-card text-text-primary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
              {...register('bio')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default Settings;
