import React, { useState } from 'react';
import { Briefcase, Search, MapPin, Building2, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';

export const InternshipJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Sample production-grade technical scholar jobs list
  const mockJobs = [
    {
      id: 'j1',
      title: 'Graduate Research Assistant (ML Systems)',
      company: 'Stanford AI Lab (SAIL)',
      location: 'Palo Alto, CA (Onsite)',
      type: 'lab',
      compensation: '$42,000 / year stipend',
      description: 'Researching optimization of transformer routing weights, MoE architectures, and decentralized model parameter sharding configurations.',
      link: 'https://ai.stanford.edu/jobs'
    },
    {
      id: 'j2',
      title: 'Compiler Engineer Intern',
      company: 'NVIDIA',
      location: 'Remote (US/Canada)',
      type: 'internship',
      compensation: '$52 / hour',
      description: 'Support GPU compiler backend architecture optimization teams writing LLVM passes, assembly translations, and scheduling pipelines.',
      link: 'https://nvidia.com/careers'
    },
    {
      id: 'j3',
      title: 'Full-Stack Developer (MERN / Go)',
      company: 'Linear App',
      location: 'Remote (Global)',
      type: 'job',
      compensation: '$135,000 - $160,000',
      description: 'Looking for a senior product engineer experienced in React, TypeScript, GraphQL, Node backend APIs, and responsive styling systems.',
      link: 'https://linear.app/careers'
    },
    {
      id: 'j4',
      title: 'Fellowship: Cryptography & ZK Primitives',
      company: 'Ethereum Foundation',
      location: 'Remote (Global)',
      type: 'fellowship',
      compensation: '$15,000 grant stipend',
      description: 'Three-month research grant program focused on development of rust-based SNARK implementations and recursive proofs optimization.',
      link: 'https://ethereum.org/fellowships'
    }
  ];



  const toggleSaveJob = (id: string) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(prev => prev.filter(item => item !== id));
    } else {
      setSavedJobs(prev => [...prev, id]);
    }
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? job.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-accent" />
            <span>Internship & Jobs Portal</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Discover research internships, open-source lab positions, graduate assistantships, and startup engineering roles.
          </p>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search job roles, labs, or company details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Job Types</option>
            <option value="internship">Internships</option>
            <option value="lab">Research Lab Positions</option>
            <option value="job">Full-time Engineering Roles</option>
            <option value="fellowship">Grants & Fellowships</option>
          </select>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="space-y-3 font-sans relative hover:border-accent/40 transition-colors">
                
                {/* Save Job Button Top Right */}
                <button
                  onClick={() => toggleSaveJob(job.id)}
                  className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors border border-border"
                  title={savedJobs.includes(job.id) ? 'Saved' : 'Save position'}
                >
                  {savedJobs.includes(job.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-accent fill-accent" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>

                <div className="pr-8 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-text-secondary font-semibold uppercase">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-border text-[9px] capitalize">
                      {job.type}
                    </span>
                    <span>•</span>
                    <span className="text-accent">{job.compensation}</span>
                  </div>
                  
                  <h4 className="text-base font-bold text-text-primary leading-tight">
                    {job.title}
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-medium pt-1">
                    <span className="flex items-center space-x-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{job.company}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{job.location}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed pt-1.5 border-t border-border/50">
                  {job.description}
                </p>

                <div className="pt-2 flex">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 font-semibold text-accent hover:underline text-xs"
                  >
                    <span>Apply for Position</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

              </Card>
            ))
          ) : (
            <Card className="text-center py-8">
              <Briefcase className="h-8 w-8 text-text-secondary mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">No positions match your search query</p>
            </Card>
          )}
        </div>

        {/* Right Side: Sidebar Panel */}
        <div className="space-y-6">
          {savedJobs.length > 0 && (
            <Card className="space-y-3 font-sans">
              <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
                Saved Positions ({savedJobs.length})
              </h4>
              <ul className="space-y-2 text-xs">
                {savedJobs.map((id) => {
                  const job = mockJobs.find(j => j.id === id);
                  if (!job) return null;
                  return (
                    <li key={id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2 border border-border rounded">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-text-primary block truncate">{job.title}</span>
                        <span className="text-[10px] text-text-secondary">{job.company}</span>
                      </div>
                      <button 
                        onClick={() => toggleSaveJob(id)} 
                        className="text-[10px] text-danger hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="space-y-3.5">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Recruit Scholars
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you looking for developers, researchers, or data scientists to join your university research labs or startup development teams? Contact admin support to set up verified postings.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default InternshipJobs;
