import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ListTodo, CheckSquare, Square, Award, ArrowLeft, BookOpen } from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const RoadmapDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const fetchRoadmapDetails = async () => {
    try {
      const res = await api.get(`/roadmaps/${slug}`);
      if (res.data.success) {
        const { roadmap: mapData, steps: stepsData } = res.data.data;
        setRoadmap(mapData);
        setSteps(stepsData);

        // Fetch user progress
        const progressRes = await api.get(`/roadmaps/${mapData._id}/progress`);
        if (progressRes.data.success) {
          setCompletedSteps(progressRes.data.data.completedSteps || []);
        }
      }
    } catch (err) {
      console.error('Error fetching roadmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapDetails();
  }, [slug]);

  const handleStepToggle = async (stepId: string) => {
    if (!roadmap || toggleLoadingId) return;
    setToggleLoadingId(stepId);
    try {
      const res = await api.post(`/roadmaps/${roadmap._id}/steps/${stepId}/toggle`);
      if (res.data.success) {
        setCompletedSteps(res.data.data.completedSteps);
      }
    } catch (err) {
      console.error('Error toggling step:', err);
    } finally {
      setToggleLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <Card className="text-center py-12">
        <h4 className="font-bold text-text-primary text-sm">Roadmap not found</h4>
        <p className="text-xs text-text-secondary mt-1">This learning pathway does not exist or has been removed.</p>
        <Link to="/feed" className="text-xs text-accent font-bold mt-4 inline-block hover:underline">
          Back to Feed
        </Link>
      </Card>
    );
  }

  const completionPercent = steps.length > 0 
    ? Math.round((completedSteps.length / steps.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <div>
        <Link 
          to="/fields" 
          className="inline-flex items-center space-x-1 text-xs text-text-secondary hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Field Explorer</span>
        </Link>
      </div>

      {/* Header card */}
      <Card className="bg-slate-50 dark:bg-slate-900/40 p-6 border border-border space-y-4">
        <div className="space-y-1">
          <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            {roadmap.difficulty} roadmap path
          </span>
          <h2 className="text-xl font-extrabold text-text-primary pt-1">{roadmap.title}</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {roadmap.description}
          </p>
        </div>

        {/* Progress tracker bar */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary flex items-center space-x-1.5">
              <ListTodo className="h-4 w-4 text-accent" />
              <span>Completion progress</span>
            </span>
            <span className="text-accent">{completedSteps.length} of {steps.length} steps ({completionPercent}%)</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Steps vertical tree timeline */}
      <div className="relative border-l border-border pl-6 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(step._id);
          return (
            <div key={step._id} className="relative space-y-2">
              
              {/* timeline node icon */}
              <button
                onClick={() => handleStepToggle(step._id)}
                disabled={toggleLoadingId === step._id}
                className={`absolute -left-[35px] top-1 h-6.5 w-6.5 rounded-full border bg-card flex items-center justify-center transition-all ${
                  isDone 
                    ? 'border-success text-success bg-success/5 shadow-sm' 
                    : 'border-border text-text-secondary hover:border-slate-400 hover:text-text-primary'
                }`}
                title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
              >
                {isDone ? (
                  <CheckSquare className="h-4.5 w-4.5 stroke-[2.5px]" />
                ) : (
                  <Square className="h-4.5 w-4.5" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-text-secondary">Node {idx + 1}</span>
                  <span className="text-border">•</span>
                  <h4 className={`text-sm font-bold transition-all ${
                    isDone ? 'text-success' : 'text-text-primary'
                  }`}>
                    {step.title}
                  </h4>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Resources details (if provided) */}
              {step.resources && step.resources.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider block mb-1">
                    Study Resources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {step.resources.map((res: any) => (
                      <a
                        key={res._id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-border text-[10px] text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Resource link</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion congratulations card */}
      {completionPercent === 100 && (
        <Card className="bg-success/5 border-success/30 flex items-center space-x-4 p-5 animate-in zoom-in-95 duration-200">
          <span className="p-3 bg-success/10 text-success rounded-full">
            <Award className="h-8 w-8" />
          </span>
          <div className="space-y-0.5">
            <h4 className="font-bold text-success text-sm">Roadmap fully completed!</h4>
            <p className="text-xs text-text-secondary">
              Outstanding work! You have finished all core foundation milestones inside this pathway.
            </p>
          </div>
        </Card>
      )}

    </div>
  );
};
export default RoadmapDetail;
