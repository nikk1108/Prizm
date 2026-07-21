import React, { useEffect, useState } from 'react';
import { Award, Search, Github, ExternalLink, Layers } from 'lucide-react';
import api from '../services/api';
import type { Post, Field } from '../types';
import PostCard from '../components/features/PostCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const ProjectShowcase: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState('');
  const [isOpenSourceOnly, setIsOpenSourceOnly] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/posts?type=project&limit=50';
      if (selectedField) url += `&field=${selectedField}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        let items = res.data.data;
        
        // Search Query Title / Architecture
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter((p: any) => 
            p.title.toLowerCase().includes(q) || 
            (p.projectDetails?.architecture && p.projectDetails.architecture.toLowerCase().includes(q))
          );
        }

        // Difficulty Filter
        if (selectedDifficulty) {
          items = items.filter((p: any) => p.projectDetails?.difficulty === selectedDifficulty);
        }

        // Open Source Only Filter
        if (isOpenSourceOnly) {
          items = items.filter((p: any) => p.projectDetails?.isOpenSourceContribution === true);
        }

        // Tech Stack tag
        if (selectedTechStack) {
          items = items.filter((p: any) => 
            p.projectDetails?.techStack?.some((t: string) => t.toLowerCase() === selectedTechStack.toLowerCase())
          );
        }

        setPosts(items);
      }
    } catch (err) {
      console.error('Error fetching showcase projects:', err);
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
    fetchProjects();
  }, [selectedField, selectedDifficulty, selectedTechStack, isOpenSourceOnly, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <Award className="h-5 w-5 text-accent" />
            <span>Project Showcase</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Discover student projects, developer tools, open-source repositories, and system architecture blueprints.
          </p>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search projects by title or system architecture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
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
      </div>

      {/* Main Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Projects List */}
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
                
                {/* Project Spec Panel below post card */}
                {post.projectDetails && (
                  <div className="mt-2 ml-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-border/80 rounded-lg text-xs space-y-3 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2">
                      <div className="flex items-center space-x-1.5 font-semibold text-text-primary">
                        <Layers className="h-3.5 w-3.5 text-accent" />
                        <span className="capitalize">Difficulty: {post.projectDetails.difficulty}</span>
                      </div>
                      
                      {post.projectDetails.isOpenSourceContribution && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-semibold">
                          Open Source Contributions Welcome
                        </span>
                      )}
                    </div>
                    
                    {post.projectDetails.techStack && post.projectDetails.techStack.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-text-secondary font-medium mr-1 uppercase">Stack:</span>
                        {post.projectDetails.techStack.map((tech: string) => (
                          <span key={tech} className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-800 border border-border rounded text-[10px] text-text-primary font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.projectDetails.architecture && (
                      <div className="space-y-1">
                        <span className="font-semibold text-text-primary text-[10px] uppercase tracking-wider block">System Architecture blueprint:</span>
                        <p className="text-text-secondary leading-relaxed font-mono text-[11px] bg-card p-2 rounded border border-border">
                          {post.projectDetails.architecture}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 pt-1">
                      {post.projectDetails.github && (
                        <a
                          href={post.projectDetails.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold text-text-primary hover:text-accent"
                        >
                          <Github className="h-3.5 w-3.5" />
                          <span>Code Repo</span>
                        </a>
                      )}
                      
                      {post.projectDetails.demo && (
                        <a
                          href={post.projectDetails.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold text-accent hover:underline"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <Card className="text-center py-12 flex flex-col items-center justify-center space-y-2">
              <Award className="h-8 w-8 text-text-secondary" />
              <h4 className="font-bold text-text-primary text-sm">No showcase projects found</h4>
              <p className="text-xs text-text-secondary max-w-sm">
                Try selecting a different difficulty, language stack, or category to see other showcases.
              </p>
            </Card>
          )}
        </div>

        {/* Right Side: Sidebar Panel */}
        <div className="space-y-6">
          <Card className="space-y-3.5">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Refine Projects
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="os-only"
                checked={isOpenSourceOnly}
                onChange={(e) => setIsOpenSourceOnly(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="os-only" className="text-xs text-text-primary select-none cursor-pointer">
                Open Source Contributions Welcome
              </label>
            </div>
          </Card>

          <Card className="space-y-3">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Popular Frameworks
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['React', 'Node.js', 'Rust', 'Python', 'Docker', 'Kubernetes', 'WebAssembly'].map((framework) => (
                <button
                  key={framework}
                  onClick={() => setSelectedTechStack(selectedTechStack === framework ? '' : framework)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                    selectedTechStack === framework
                      ? 'bg-accent/10 border-accent text-accent font-semibold'
                      : 'bg-card border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {framework}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ProjectShowcase;
