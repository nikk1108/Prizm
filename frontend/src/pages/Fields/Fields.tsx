import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash, Users, FileText, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import type { Field } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

export const Fields: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchFields = async () => {
    try {
      const res = await api.get('/fields');
      if (res.data.success) {
        setFields(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching fields list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleFollowToggle = async (e: React.MouseEvent, field: Field) => {
    e.preventDefault();
    if (!user) return;

    setActionLoadingId(field._id);
    const isFollowing = user.fieldsFollowed && user.fieldsFollowed.includes(field._id);

    try {
      const endpoint = `/fields/${field._id}/${isFollowing ? 'unfollow' : 'follow'}`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        await refreshUser();
        // Adjust local counts
        setFields(prev => prev.map(f => {
          if (f._id === field._id) {
            return {
              ...f,
              followersCount: Math.max(0, f.followersCount + (isFollowing ? -1 : 1))
            };
          }
          return f;
        }));
      }
    } catch (err) {
      console.error('Error toggling field follow:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-text-primary">Explore Knowledge Fields</h3>
        <p className="text-xs text-text-secondary">
          Browse academic topics, programming languages, system paradigms, and research frameworks.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4.5 w-16" />
                <Skeleton className="h-7 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => {
            const isFollowing = user?.fieldsFollowed && user.fieldsFollowed.includes(field._id);
            return (
              <Card key={field._id} className="flex flex-col justify-between hover:shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-accent/10 text-accent">
                      <Hash className="h-4.5 w-4.5" />
                    </span>
                    <Link to={`/fields/${field.slug}`} className="font-bold text-text-primary text-sm hover:text-accent transition-colors">
                      {field.name}
                    </Link>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {field.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                  <div className="flex items-center space-x-3 text-[10px] text-text-secondary">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{field.followersCount} followers</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{field.postsCount} posts</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Button
                      variant={isFollowing ? 'outline' : 'primary'}
                      size="sm"
                      onClick={(e) => handleFollowToggle(e, field)}
                      loading={actionLoadingId === field._id}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    
                    <Link
                      to={`/fields/${field.slug}`}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-border text-text-secondary transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Fields;
