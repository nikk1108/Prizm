import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, BookOpen, GraduationCap, Code2, 
  School, Briefcase, FileText, Activity
} from 'lucide-react';
import api from '../services/api';
import type { User, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import PostCard from '../components/features/PostCard';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Tabs: posts, reputation, followers
  const [activeTab, setActiveTab] = useState<'posts' | 'reputation' | 'followers'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [reputationLogs, setReputationLogs] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<User[]>([]);

  const fetchProfileDetails = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data.success) {
        setProfileUser(res.data.data.user);
        setFollowersCount(res.data.data.followersCount);
        setFollowingCount(res.data.data.followingCount);

        // Check if current user is following this profile
        if (currentUser) {
          const followCheck = await api.get(`/users/${currentUser.id || currentUser._id}/following`);
          if (followCheck.data.success) {
            const list = followCheck.data.data as User[];
            setIsFollowing(list.some(u => u._id === res.data.data.user._id));
          }
        }

        // Fetch user posts
        const postsRes = await api.get(`/posts?author=${res.data.data.user._id}`);
        if (postsRes.data.success) {
          // Filter locally since Mongoose handles tags/author
          const items = postsRes.data.data as Post[];
          setUserPosts(items.filter(p => p.author._id === res.data.data.user._id || p.author.id === res.data.data.user._id));
        }

        // Fetch reputation logs
        const repRes = await api.get(`/users/${res.data.data.user._id}/reputation`);
        if (repRes.data.success) {
          setReputationLogs(repRes.data.data);
        }

        // Fetch followers list
        const followersRes = await api.get(`/users/${res.data.data.user._id}/followers`);
        if (followersRes.data.success) {
          setFollowersList(followersRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileDetails();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setLoadingFollow(true);
    try {
      const endpoint = `/users/${profileUser._id}/${isFollowing ? 'unfollow' : 'follow'}`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => prev + (isFollowing ? -1 : 1));
        await refreshUser();
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'professor': return <span title="Professor"><GraduationCap className="h-5 w-5 text-blue-500" /></span>;
      case 'researcher': return <span title="Researcher"><BookOpen className="h-5 w-5 text-green-500" /></span>;
      case 'developer': return <span title="Developer"><Code2 className="h-5 w-5 text-orange-500" /></span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-1.5 flex-1 pt-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <Card className="text-center py-12">
        <h4 className="font-bold text-text-primary text-sm">Profile not found</h4>
        <p className="text-xs text-text-secondary mt-1">This user account has been suspended or deleted.</p>
        <Link to="/feed" className="text-xs text-accent font-bold mt-4 inline-block hover:underline">
          Back to Feed
        </Link>
      </Card>
    );
  }

  const isSelf = currentUser?.id === profileUser._id || currentUser?._id === profileUser._id;

  return (
    <div className="space-y-6">
      
      {/* Profile Header panel */}
      <Card className="relative overflow-hidden p-0 border border-border">
        {/* Mock Cover Image */}
        <div className="h-32 bg-slate-100 dark:bg-slate-900 border-b border-border flex items-center justify-center text-text-secondary font-mono text-[10px] uppercase tracking-widest">
          Prizm Scholar Workspace
        </div>

        {/* Profile Details area */}
        <div className="p-6 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Profile pic */}
            <div className="-mt-16 relative">
              {profileUser.profilePicture ? (
                <img
                  src={profileUser.profilePicture}
                  alt={profileUser.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-sm bg-card"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary border-4 border-card text-3xl font-bold flex items-center justify-center uppercase shadow-sm">
                  {profileUser.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-text-primary">
                  {profileUser.name}
                </h2>
                {getBadgeIcon(profileUser.verificationBadge)}
              </div>
              
              {profileUser.profession && (
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{profileUser.profession}</span>
                </div>
              )}

              {profileUser.university && (
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <School className="h-3.5 w-3.5" />
                  <span>{profileUser.university}</span>
                </div>
              )}
            </div>
          </div>

          {/* Followers count and Follow action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex space-x-4 text-xs text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">{followersCount}</span> followers
              </div>
              <div>
                <span className="font-semibold text-text-primary">{followingCount}</span> following
              </div>
              <div>
                <span className="font-semibold text-text-primary">{profileUser.reputation}</span> Reputation
              </div>
            </div>

            {!isSelf && (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                onClick={handleFollowToggle}
                loading={loadingFollow}
                size="sm"
              >
                {isFollowing ? 'Unfollow' : 'Follow User'}
              </Button>
            )}
          </div>
        </div>

        {/* Bio & Skills Panel */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-4 text-xs">
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
              Profile Biography
            </h4>
            <p className="text-text-secondary leading-relaxed">
              {profileUser.bio || 'This professional has not set a biography details yet.'}
            </p>
          </div>

          <div className="space-y-4">
            {profileUser.skills.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
                  Skills Catalog
                </h4>
                <div className="flex flex-wrap gap-1">
                  {profileUser.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-border px-2 py-0.5 rounded text-[10px] font-mono text-text-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profileUser.interests.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
                  Interests
                </h4>
                <div className="flex flex-wrap gap-1">
                  {profileUser.interests.map((interest: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-border px-2 py-0.5 rounded text-[10px] font-mono text-text-secondary">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabbed view: contributions or reputation logs */}
      <div className="space-y-4">
        <div className="border-b border-border flex space-x-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'posts' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-1" />
            Contributions ({userPosts.length})
          </button>
          
          <button
            onClick={() => setActiveTab('reputation')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'reputation' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-1" />
            Reputation Ledger ({reputationLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'followers' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="h-4 w-4 inline mr-1" />
            Followers ({followersList.length})
          </button>
        </div>

        {/* Tab content rendering */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic">
                No contributions shared yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'reputation' && (
          <Card className="p-0 border border-border overflow-hidden">
            {reputationLogs.length > 0 ? (
              <div className="divide-y divide-border text-xs text-text-secondary">
                {reputationLogs.map((log) => (
                  <div key={log._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-text-primary capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-text-secondary block">
                        Logged on {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <span className={`font-mono font-bold text-sm ${log.points >= 0 ? 'text-success' : 'text-danger'}`}>
                      {log.points >= 0 ? `+${log.points}` : log.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic">
                No reputation history logged.
              </div>
            )}
          </Card>
        )}

        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followersList.length > 0 ? (
              followersList.map(follower => (
                <Card key={follower._id} className="flex items-center space-x-3 p-4 hover:shadow-sm">
                  {follower.profilePicture ? (
                    <img
                      src={follower.profilePicture}
                      alt={follower.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary text-sm font-bold flex items-center justify-center uppercase">
                      {follower.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${follower._id}`} className="font-bold text-text-primary text-xs hover:underline block truncate">
                      {follower.name}
                    </Link>
                    <span className="text-[10px] text-text-secondary block truncate">
                      {follower.reputation} Reputation • {follower.profession || 'Scholar'}
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic col-span-2">
                No followers listed yet.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
export default Profile;
