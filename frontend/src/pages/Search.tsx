import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, FileText, Hash, Users, Filter } from 'lucide-react';
import api from '../services/api';
import type { Post, User, Field } from '../types';
import PostCard from '../components/features/PostCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState<'posts' | 'fields' | 'users'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const executeSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setPosts(res.data.data.posts);
        setUsers(res.data.data.users);
        setFields(res.data.data.fields);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      executeSearch();
    }
  }, [query]);

  // Apply local sorting and filtering logic
  const getFilteredPosts = () => {
    let list = [...posts];
    if (typeFilter) {
      list = list.filter(p => p.type === typeFilter);
    }
    if (sortOrder === 'latest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'upvotes') {
      list.sort((a, b) => b.upvotesCount - a.upvotesCount);
    }
    return list;
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header title */}
      <div>
        <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
          <SearchIcon className="h-5 w-5 text-accent" />
          <span>Search results for "{query}"</span>
        </h3>
        <p className="text-xs text-text-secondary">
          Global index search matching database text logs.
        </p>
      </div>

      {/* Tabs list */}
      <div className="border-b border-border flex space-x-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'posts' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-1" />
          Posts ({getFilteredPosts().length})
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'fields' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Hash className="h-4 w-4 inline mr-1" />
          Fields ({fields.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'users' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users className="h-4 w-4 inline mr-1" />
          People ({users.length})
        </button>
      </div>

      {/* Posts specific filters bar */}
      {activeTab === 'posts' && (
        <Card className="p-3 border border-border flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30">
          <div className="flex items-center space-x-2 text-xs text-text-secondary font-medium">
            <Filter className="h-4 w-4" />
            <span>Filter results:</span>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-card text-text-primary border border-border rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">All Formats</option>
              <option value="insight">Insight</option>
              <option value="research">Research</option>
              <option value="tutorial">Tutorial</option>
              <option value="project">Project</option>
              <option value="question">Question</option>
              <option value="resource">Resource</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs bg-card text-text-primary border border-border rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </Card>
      )}

      {/* Results Rendering */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'posts' && (
            getFilteredPosts().length > 0 ? (
              getFilteredPosts().map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic">
                No matching posts found.
              </div>
            )
          )}

          {activeTab === 'fields' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.length > 0 ? (
                fields.map(field => (
                  <Card key={field._id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <Link to={`/fields/${field.slug}`} className="font-bold text-text-primary text-sm hover:underline block">
                        {field.name}
                      </Link>
                      <p className="text-[11px] text-text-secondary line-clamp-1">{field.description}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-text-secondary italic col-span-2">
                  No matching fields found.
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.length > 0 ? (
                users.map(user => (
                  <Card key={user._id} className="flex items-center space-x-3 p-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary text-sm font-bold flex items-center justify-center uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link to={`/profile/${user._id}`} className="font-bold text-text-primary text-sm hover:underline block">
                        {user.name}
                      </Link>
                      <span className="text-[10px] text-text-secondary block">
                        {user.reputation} reputation • {user.profession || 'Educator / Engineer'}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-text-secondary italic col-span-2">
                  No matching developers or profiles found.
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default Search;
