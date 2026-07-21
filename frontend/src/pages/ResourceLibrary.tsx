import React, { useEffect, useState } from 'react';
import { Library, Search, ExternalLink, Star, Globe } from 'lucide-react';
import api from '../services/api';
import type { Post, Field } from '../types';
import PostCard from '../components/features/PostCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const ResourceLibrary: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const resourceTypes = [
    { label: 'Books', value: 'book' },
    { label: 'Courses', value: 'course' },
    { label: 'Documentation', value: 'documentation' },
    { label: 'GitHub Repositories', value: 'repo' },
    { label: 'Cheat Sheets', value: 'cheatsheet' },
    { label: 'Datasets', value: 'dataset' },
    { label: 'Tools', value: 'tool' }
  ];

  const fetchResources = async () => {
    setLoading(true);
    try {
      let url = '/posts?type=resource&limit=50';
      if (selectedField) url += `&field=${selectedField}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        let items = res.data.data;
        
        // Filter by Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter((p: any) => 
            p.title.toLowerCase().includes(q) || 
            (p.resourceDetails?.description && p.resourceDetails.description.toLowerCase().includes(q))
          );
        }

        // Filter by Resource Type
        if (selectedType) {
          items = items.filter((p: any) => p.resourceDetails?.resourceType === selectedType);
        }

        setPosts(items);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await api.get('/fields');
        if (res.data.success) {
          setFields(res.data.data);
        }
      } catch (err) {
        console.error('Error loading fields:', err);
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedField, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <Library className="h-5 w-5 text-accent" />
            <span>Resource Library</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Access developer checklists, reference manuals, tutorials, dataset catalogs, and useful GitHub repositories.
          </p>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search resource titles or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            {fields.map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent text-capitalize"
          >
            <option value="">All Resource Types</option>
            {resourceTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Resources List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            [1, 2, 3].map((n) => (
              <Card key={n} className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="relative group">
                <PostCard post={post} />
                
                {/* Resource Spec Panel below post card */}
                {post.resourceDetails && (
                  <div className="mt-2 ml-4 p-3 bg-slate-50 dark:bg-slate-900/40 border border-border/80 rounded-lg text-xs space-y-2 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary capitalize flex items-center space-x-1.5">
                        <Globe className="h-3.5 w-3.5 text-accent" />
                        <span>Type: {post.resourceDetails.resourceType}</span>
                      </span>
                      
                      {post.resourceDetails.rating !== undefined && (
                        <span className="text-text-primary flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold">{post.resourceDetails.rating}/5</span>
                        </span>
                      )}
                    </div>
                    
                    {post.resourceDetails.description && (
                      <p className="text-text-secondary leading-relaxed">
                        {post.resourceDetails.description}
                      </p>
                    )}

                    {post.resourceDetails.url && (
                      <div className="pt-1">
                        <a
                          href={post.resourceDetails.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold text-accent hover:underline"
                        >
                          <span>Access Resource</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Card className="text-center py-12 flex flex-col items-center justify-center space-y-2">
              <Library className="h-8 w-8 text-text-secondary" />
              <h4 className="font-bold text-text-primary text-sm">No resources found</h4>
              <p className="text-xs text-text-secondary max-w-sm">
                Try selecting a different type or clearing filters to see other reference material.
              </p>
            </Card>
          )}
        </div>

        {/* Right Side: Sidebar Panel */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Filter by Type
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {resourceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(selectedType === type.value ? '' : type.value)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                    selectedType === type.value
                      ? 'bg-accent/10 border-accent text-accent font-semibold'
                      : 'bg-card border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ResourceLibrary;
