import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Hash, Users, FileText, Compass, ListTodo } from 'lucide-react';
import api from '../services/api';
import type { Field, Post, PostType } from '../types';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import PostCard from '../components/features/PostCard';

export const FieldDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, refreshUser } = useAuth();

  const [field, setField] = useState<Field | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Tabs: posts (sub-filtered by format type), roadmaps
  const [activeTab, setActiveTab] = useState<'all' | PostType | 'roadmaps'>('all');

  const fetchFieldData = async () => {
    try {
      const res = await api.get(`/fields/${slug}`);
      if (res.data.success) {
        const fieldData = res.data.data;
        setField(fieldData);

        // Fetch posts for this field
        const postsRes = await api.get(`/posts?field=${fieldData._id}`);
        if (postsRes.data.success) {
          // Filter locally since Mongoose handles tags/author
          const items = postsRes.data.data as Post[];
          setPosts(items.filter(p => p.field === fieldData._id || (typeof p.field === 'object' && p.field._id === fieldData._id)));
        }

        // Fetch roadmaps
        const roadmapsRes = await api.get(`/fields/${fieldData._id}/roadmaps`);
        if (roadmapsRes.data.success) {
          setRoadmaps(roadmapsRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading field detail data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFieldData();
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!field || !user) return;
    setActionLoading(true);
    const isFollowing = user.fieldsFollowed && user.fieldsFollowed.includes(field._id);
    
    try {
      const endpoint = `/fields/${field._id}/${isFollowing ? 'unfollow' : 'follow'}`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        await refreshUser();
        setField(prev => prev ? {
          ...prev,
          followersCount: Math.max(0, prev.followersCount + (isFollowing ? -1 : 1))
        } : null);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!field) {
    return (
      <Card className="text-center py-12">
        <h4 className="font-bold text-text-primary text-sm">Field not found</h4>
        <p className="text-xs text-text-secondary mt-1">This category does not exist or has been removed.</p>
        <Link to="/fields" className="text-xs text-accent font-bold mt-4 inline-block hover:underline">
          Back to Fields Catalog
        </Link>
      </Card>
    );
  }

  const isFollowing = user?.fieldsFollowed && user.fieldsFollowed.includes(field._id);

  // Apply sub-filters based on selected format tabs
  const getFilteredPosts = () => {
    if (activeTab === 'all' || activeTab === 'roadmaps') return posts;
    return posts.filter(p => p.type === activeTab);
  };

  const formats: Array<{ label: string; value: 'all' | PostType }> = [
    { label: 'All Contribs', value: 'all' },
    { label: 'Insights', value: 'insight' },
    { label: 'Research Papers', value: 'research' },
    { label: 'Tutorials', value: 'tutorial' },
    { label: 'Showcases', value: 'project' },
    { label: 'Questions', value: 'question' },
    { label: 'Resources', value: 'resource' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Field header details */}
      <Card className="bg-slate-50 dark:bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <Hash className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold text-text-primary">{field.name}</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            {field.description}
          </p>

          {/* Counts */}
          <div className="flex items-center space-x-4 text-[10px] text-text-secondary pt-1">
            <span className="flex items-center space-x-1">
              <Users className="h-3.5 w-3.5" />
              <span>{field.followersCount} Followers</span>
            </span>
            <span className="flex items-center space-x-1">
              <FileText className="h-3.5 w-3.5" />
              <span>{field.postsCount} Contributed posts</span>
            </span>
          </div>
        </div>

        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          onClick={handleFollowToggle}
          loading={actionLoading}
          size="sm"
          className="self-start md:self-center shrink-0"
        >
          {isFollowing ? 'Following Category' : 'Follow Field'}
        </Button>
      </Card>

      {/* Main filter layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Tab filters list */}
        <div className="space-y-4">
          <Card className="space-y-3 p-3">
            <div className="flex items-center space-x-1.5 border-b border-border pb-2.5 px-2">
              <Compass className="h-4 w-4 text-accent" />
              <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
                Category Streams
              </h4>
            </div>

            <nav className="space-y-1">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setActiveTab(fmt.value)}
                  className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                    activeTab === fmt.value
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}

              <button
                onClick={() => setActiveTab('roadmaps')}
                className={`w-full text-left px-3 py-2 text-xs rounded transition-colors flex items-center justify-between ${
                  activeTab === 'roadmaps'
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Learning Roadmaps</span>
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-[10px] text-text-secondary px-1.5 py-0.5 rounded font-mono shrink-0">
                  {roadmaps.length}
                </span>
              </button>
            </nav>
          </Card>
        </div>

        {/* Right main column display */}
        <div className="lg:col-span-3 space-y-4">
          
          {activeTab === 'roadmaps' ? (
            /* Roadmaps Grid lists */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roadmaps.map((map) => (
                <Card key={map._id} hoverEffect className="space-y-3">
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded font-mono text-text-secondary uppercase tracking-wider">
                    {map.difficulty} roadmap
                  </span>
                  
                  <h4 className="font-bold text-text-primary text-sm leading-snug">{map.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {map.description}
                  </p>
                  
                  <Link
                    to={`/roadmaps/${map.slug}`}
                    className="text-xs text-accent hover:underline font-semibold block pt-2"
                  >
                    View Learning Path &rarr;
                  </Link>
                </Card>
              ))}
              
              {roadmaps.length === 0 && (
                <div className="text-center py-12 text-xs text-text-secondary italic col-span-2 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-border rounded-lg">
                  No learning roadmaps mapped to this field yet.
                </div>
              )}
            </div>
          ) : (
            /* Feeds list */
            <div className="space-y-4">
              {getFilteredPosts().length > 0 ? (
                getFilteredPosts().map(post => <PostCard key={post._id} post={post} />)
              ) : (
                <div className="text-center py-12 text-xs text-text-secondary italic bg-slate-50 dark:bg-slate-900/30 border border-dashed border-border rounded-lg">
                  No contributed posts found in this stream.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default FieldDetail;
