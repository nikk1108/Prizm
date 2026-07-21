import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, Calendar, Flame, GraduationCap } from 'lucide-react';
import type { RootState } from '../../store';
import { setActiveFeedType } from '../../store/uiSlice';
import api from '../../services/api';
import type { Post } from '../../types';
import PostCard from '../../components/features/PostCard';
import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';

export const Feed: React.FC = () => {
  const dispatch = useDispatch();
  const activeFeedType = useSelector((state: RootState) => state.ui.activeFeedType);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Widget panel mock data for professional vibe
  const trendingToday = [
    { title: 'Designing distributed consensus in Rust networks', slug: 'rust-consensus-networks', views: '2.5k' },
    { title: 'Evaluation of zero-knowledge rollups on Layer 2 protocols', slug: 'zk-rollups-l2', views: '1.8k' },
    { title: 'Fine-tuning LLMs on custom dataset catalogs', slug: 'finetuning-llms-catalog', views: '1.2k' }
  ];

  const upcomingEvents = [
    { title: 'Decentralized Data Summit 2026', date: 'Jul 28', type: 'Conference' },
    { title: 'Open-Source AI Hackathon', date: 'Aug 04', type: 'Hackathon' }
  ];

  const fetchFeed = async (feedType: string, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const url = `/posts?feedType=${feedType}${isLoadMore && cursor ? `&cursor=${cursor}` : ''}`;
      const res = await api.get(url);
      
      if (res.data.success) {
        if (isLoadMore) {
          setPosts(prev => [...prev, ...res.data.data]);
        } else {
          setPosts(res.data.data);
        }
        setCursor(res.data.nextCursor || null);
      }
    } catch (err) {
      console.error('Error fetching feed posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeFeedType);
  }, [activeFeedType]);

  const handleLoadMore = () => {
    if (cursor) {
      fetchFeed(activeFeedType, true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Center Main Feed section */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="border-b border-border flex space-x-6">
          {(['latest', 'trending', 'following', 'recommended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setActiveFeedType(tab))}
              className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all capitalize ${
                activeFeedType === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts List container */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-14 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            
            {/* Load more triggers */}
            {cursor && (
              <div className="text-center pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs font-semibold text-accent hover:underline bg-accent/5 px-4 py-2 rounded-md border border-accent/10 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading older posts...' : 'Load older content'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Card className="text-center py-12 flex flex-col items-center justify-center space-y-3">
            <Sparkles className="h-8 w-8 text-text-secondary animate-pulse" />
            <h4 className="font-bold text-text-primary text-sm">Feed is currently empty</h4>
            <p className="text-xs text-text-secondary max-w-sm">
              Subscribe to some fields, follow developers, or share your own engineering showcase to populate the feed.
            </p>
          </Card>
        )}
      </div>

      {/* Right widgets panel */}
      <div className="space-y-6 hidden lg:block">
        
        {/* Daily Knowledge digest widget */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-border pb-2.5">
            <Flame className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Trending Today
            </h4>
          </div>

          <ul className="space-y-3">
            {trendingToday.map((item, idx) => (
              <li key={idx} className="group">
                <a href={`/posts/${item.slug}`} className="block">
                  <span className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {item.views} readers reading
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* Events widget */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-border pb-2.5">
            <Calendar className="h-4.5 w-4.5 text-accent" />
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Upcoming Events
            </h4>
          </div>

          <ul className="space-y-3">
            {upcomingEvents.map((item, idx) => (
              <li key={idx} className="flex justify-between items-start space-x-2">
                <div>
                  <span className="text-xs font-semibold text-text-primary block leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-text-secondary uppercase">
                    {item.type}
                  </span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-text-secondary shrink-0 font-medium">
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Academics guidelines/credibility prompt widget */}
        <Card className="bg-slate-50 dark:bg-slate-900/40 space-y-2">
          <div className="flex items-center space-x-1.5">
            <GraduationCap className="h-4 w-4 text-green-500" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Platform Policy
            </span>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Prizm is a dedicated sandbox for educational discussions, technical papers, engineering demos, and code tutorials. Entertainment news and non-technical spam are subject to community reports.
          </p>
        </Card>

      </div>
    </div>
  );
};
export default Feed;
