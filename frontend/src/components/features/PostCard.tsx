import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  ArrowUp, MessageSquare, Eye, Clock, X, MoreVertical, Edit2, Trash2, Copy, 
  BarChart2, Share2, Link as LinkIcon, Flag 
} from 'lucide-react';
import type { Post } from '../../types';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getImageUrl } from '../../utils/image';
import { useAuth } from '../../context/AuthContext';
import { setComposeOpen, setEditPostData } from '../../store/uiSlice';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const [upvotes, setUpvotes] = useState(post.upvotesCount);
  const [upvoted, setUpvoted] = useState(false); // Can fetch from reactions if required
  const [loadingVote, setLoadingVote] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const authorId = post.author._id || post.author.id || (typeof post.author === 'object' ? post.author._id : post.author);
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUser && authorId && currentUserId && (authorId.toString() === currentUserId.toString());

  const handleEdit = () => {
    dispatch(setEditPostData(post));
    dispatch(setComposeOpen(true));
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        setIsDeleted(true);
        setDeleteConfirmOpen(false);
        setToastMessage('Post deleted successfully');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/duplicate`);
      if (res.data.success) {
        setShowMenu(false);
        setToastMessage('Duplicated as draft successfully');
        setTimeout(() => {
          setToastMessage(null);
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to duplicate post:', err);
      alert(err.response?.data?.error || 'Failed to duplicate post');
    }
  };

  const handleShare = async () => {
    setShowMenu(false);
    const postUrl = `${window.location.origin}/posts/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: postUrl
        });
      } catch (err) {
        console.warn('Share canceled', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    setShowMenu(false);
    const postUrl = `${window.location.origin}/posts/${post.slug}`;
    navigator.clipboard.writeText(postUrl);
    setToastMessage('Link copied to clipboard');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReport = async () => {
    setShowMenu(false);
    const reason = window.prompt('Please enter the reason for reporting this post:');
    if (!reason || !reason.trim()) return;
    
    try {
      const res = await api.post(`/posts/${post._id}/report`, {
        reason: reason.trim()
      });
      if (res.data.success) {
        setToastMessage('Post reported successfully');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to report post:', err);
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loadingVote) return;
    setLoadingVote(true);
    try {
      const res = await api.post(`/posts/${post._id}/upvote`);
      if (res.data.success) {
        setUpvoted(res.data.upvoted);
        setUpvotes(res.data.upvotesCount);
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    } finally {
      setLoadingVote(false);
    }
  };

  // Get type-specific badge styling
  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      insight: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800/80',
      research: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50',
      tutorial: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50',
      project: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50',
      question: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50',
      resource: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800/80',
      news: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${styles[type] || styles.insight}`}>
        {type}
      </span>
    );
  };

  if (isDeleted) return null;

  return (
    <Card hoverEffect className="relative flex flex-col space-y-3.5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-950 text-slate-50 border border-slate-850 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 font-sans">
            <h4 className="text-base font-bold text-text-primary">Delete Post</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h4 className="text-base font-bold text-text-primary">Post Insights</h4>
              <button onClick={() => setAnalyticsOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-secondary uppercase block mb-1">Total Views</span>
                <span className="text-lg font-bold text-text-primary">{post.viewsCount || 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-secondary uppercase block mb-1">Upvotes</span>
                <span className="text-lg font-bold text-text-primary">{upvotes || 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border text-center col-span-2">
                <span className="text-[10px] text-text-secondary uppercase block mb-1">Est. Reading Time</span>
                <span className="text-sm font-semibold text-text-primary">{post.readingTime || 1} Minute(s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top author bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Link to={`/profile/${post.author._id || post.author.id}`} className="shrink-0">
            {post.author.profilePicture ? (
              <img
                src={getImageUrl(post.author.profilePicture)}
                alt={post.author.name}
                className="h-7 w-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-text-primary text-xs font-bold flex items-center justify-center uppercase">
                {post.author.name.charAt(0)}
              </div>
            )}
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <Link to={`/profile/${post.author._id || post.author.id}`} className="text-xs font-semibold text-text-primary hover:underline">
                {post.author.name}
              </Link>
              <span className="text-[10px] text-text-secondary">
                ({post.author.reputation} reputation)
              </span>
            </div>
            <span className="text-[9px] text-text-secondary leading-none">
              {new Date(post.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 relative">
          {getTypeBadge(post.type)}
          
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors ml-1"
            title="Post actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} 
              />
              <div className="absolute right-0 top-7 w-44 bg-card border border-border rounded-md shadow-lg py-1 z-20 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-100">
                {isOwner ? (
                  <>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(); }}
                      className="w-full text-left px-3 py-2 text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmOpen(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-danger hover:bg-danger/5 flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Post</span>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDuplicate(); }}
                      className="w-full text-left px-3 py-2 text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Duplicate as Draft</span>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAnalyticsOpen(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span>View Analytics</span>
                    </button>
                  </>
                ) : null}
                
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
                
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyLink(); }}
                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </button>

                {!isOwner && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport(); }}
                    className="w-full text-left px-3 py-2 text-warning hover:bg-warning/5 flex items-center space-x-2 border-t border-border mt-1 transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report Post</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title & snippet */}
      <div className="space-y-1">
        <Link to={`/posts/${post.slug}`} className="block group">
          <h4 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors leading-tight">
            {post.title}
          </h4>
        </Link>
        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
          {post.content.replace(/[#*`[\]()]/g, '')} {/* Strip basic markdown symbols for snippet */}
        </p>
      </div>

      {/* Responsive Image Gallery */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mt-1.5 ${
          post.images.length === 1 
            ? 'grid-cols-1' 
            : post.images.length === 2 
            ? 'grid-cols-2' 
            : 'grid-cols-3'
        }`}>
          {post.images.map((imgUrl, index) => (
            <div 
              key={index} 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveLightbox(getImageUrl(imgUrl)); }}
              className="relative aspect-video rounded-md overflow-hidden border border-border bg-slate-50 dark:bg-slate-900 cursor-zoom-in group"
            >
              <img 
                src={getImageUrl(imgUrl)} 
                alt={`Post image ${index + 1}`} 
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
          onClick={() => setActiveLightbox(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={() => setActiveLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={activeLightbox} 
            alt="Lightbox preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-md"
          />
        </div>
      )}

      {/* Dynamic Sub-Metadata (DOI / Tech Stack details if applicable) */}
      {post.type === 'research' && post.researchDetails?.doi && (
        <div className="text-[10px] font-mono text-text-secondary bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-border inline-block self-start">
          DOI: {post.researchDetails.doi}
        </div>
      )}
      
      {post.type === 'project' && post.projectDetails?.techStack && (
        <div className="flex flex-wrap gap-1">
          {post.projectDetails.techStack.slice(0, 4).map((tech, idx) => (
            <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-[9px] font-mono text-text-secondary">
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Bottom action controls */}
      <div className="flex items-center justify-between border-t border-border pt-3 mt-1 text-text-secondary">
        <div className="flex items-center space-x-4">
          {/* Upvote reaction */}
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-1 text-xs hover:text-accent transition-colors py-1 px-2 rounded-md ${
              upvoted ? 'text-accent bg-accent/5 font-semibold border border-accent/15' : 'border border-transparent'
            }`}
          >
            <ArrowUp className={`h-4.5 w-4.5 ${upvoted ? 'stroke-[2.5px]' : ''}`} />
            <span>{upvotes}</span>
          </button>

          {/* Comments link */}
          <Link to={`/posts/${post.slug}#comments`} className="flex items-center space-x-1.5 text-xs hover:text-text-primary transition-colors py-1">
            <MessageSquare className="h-4 w-4" />
            <span>Discussion</span>
          </Link>
        </div>

        {/* Right tags */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-1 text-[10px] text-text-secondary">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readingTime} min read</span>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-text-secondary">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.viewsCount} views</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
export default PostCard;
