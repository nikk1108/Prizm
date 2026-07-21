import React, { useEffect, useState } from 'react';
import { BookOpen, Search, FileText, Download } from 'lucide-react';
import api from '../services/api';
import type { Post, Field } from '../types';
import PostCard from '../components/features/PostCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const ResearchExplorer: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

  const fetchResearch = async () => {
    setLoading(true);
    try {
      let url = '/posts?type=research&limit=50';
      if (selectedField) url += `&field=${selectedField}`;
      if (selectedTag) url += `&tag=${selectedTag}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        let papers = res.data.data;
        
        // Filter by Search Title/Abstract client-side for precision
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          papers = papers.filter((p: any) => 
            p.title.toLowerCase().includes(q) || 
            (p.researchDetails?.abstract && p.researchDetails.abstract.toLowerCase().includes(q))
          );
        }

        // Filter by Publication Year client-side if researchDetails has date/year
        if (selectedYear) {
          papers = papers.filter((p: any) => {
            if (!p.createdAt) return false;
            const year = new Date(p.createdAt).getFullYear().toString();
            return year === selectedYear;
          });
        }

        setPosts(papers);
      }
    } catch (err) {
      console.error('Error fetching research papers:', err);
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
    fetchResearch();
  }, [selectedField, selectedTag, selectedYear, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <span>Research Explorer</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Access, read, and discuss peer-reviewed research papers, conference drafts, and technical specs.
          </p>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search papers by title or abstract keywords..."
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
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Papers List */}
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
                
                {/* Expandable abstract and Spec Panel below post card */}
                {post.researchDetails && (
                  <div className="mt-2 ml-4 p-3 bg-slate-50 dark:bg-slate-900/40 border border-border/80 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary flex items-center space-x-1">
                        <FileText className="h-3.5 w-3.5 text-accent" />
                        <span>DOI: {post.researchDetails.doi || 'N/A'}</span>
                      </span>
                      {post.researchDetails.pdfUrl && (
                        <a
                          href={post.researchDetails.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-accent hover:underline flex items-center space-x-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF Spec</span>
                        </a>
                      )}
                    </div>
                    
                    <p className={`text-text-secondary leading-relaxed ${expandedAbstractId === post._id ? '' : 'line-clamp-2'}`}>
                      {post.researchDetails.abstract || 'No abstract preview provided.'}
                    </p>
                    
                    <button
                      onClick={() => setExpandedAbstractId(expandedAbstractId === post._id ? null : post._id)}
                      className="text-[10px] font-bold text-accent hover:underline"
                    >
                      {expandedAbstractId === post._id ? 'Collapse Abstract' : 'Expand Abstract Preview'}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <Card className="text-center py-12 flex flex-col items-center justify-center space-y-2">
              <BookOpen className="h-8 w-8 text-text-secondary" />
              <h4 className="font-bold text-text-primary text-sm">No research papers found</h4>
              <p className="text-xs text-text-secondary max-w-sm">
                Try selecting a different category or clearing filters to see other publications.
              </p>
            </Card>
          )}
        </div>

        {/* Right Side: Sidebar Spec Panel */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Academic Peer Review
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Research contributions undergo approval checks by verifying credentials from authors and institutions. Verified articles display a checkmark logo.
            </p>
          </Card>

          <Card className="space-y-3">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Machine Learning', 'Cryptography', 'Database Design', 'Distributed Systems', 'Security'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                    selectedTag === tag
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-card border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ResearchExplorer;
