import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  ArrowUp, MessageSquare, Clock, Eye, Send, Check, 
  Sparkles, ExternalLink, Star, X, MoreVertical, Edit2, Trash2, Copy,
  BarChart2, Share2, Link as LinkIcon, Flag
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import api from '../services/api';
import type { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { getImageUrl } from '../utils/image';
import { setComposeOpen, setEditPostData } from '../store/uiSlice';

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  
  // 1. Comments creation states
  const [newCommentVal, setNewCommentVal] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // 2. Upvote states
  const [upvotes, setUpvotes] = useState(0);
  const [upvoted, setUpvoted] = useState(false);

  // 3. AI Summary Panel states
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const authorId = post?.author?._id || post?.author?.id || (typeof post?.author === 'object' ? post?.author?._id : post?.author);
  const currentUserId = user?.id || user?._id;
  const isOwner = user && authorId && currentUserId && (authorId.toString() === currentUserId.toString());

  const handleEdit = () => {
    dispatch(setEditPostData(post));
    dispatch(setComposeOpen(true));
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    if (!post) return;
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        setDeleteConfirmOpen(false);
        setToastMessage('Post deleted successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/feed');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleDuplicate = async () => {
    if (!post) return;
    try {
      const res = await api.post(`/posts/${post._id}/duplicate`);
      if (res.data.success) {
        setShowMenu(false);
        setToastMessage('Duplicated as draft successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/feed');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to duplicate post:', err);
      alert(err.response?.data?.error || 'Failed to duplicate post');
    }
  };

  const handleShare = async () => {
    if (!post) return;
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
    if (!post) return;
    setShowMenu(false);
    const postUrl = `${window.location.origin}/posts/${post.slug}`;
    navigator.clipboard.writeText(postUrl);
    setToastMessage('Link copied to clipboard');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReport = async () => {
    if (!post) return;
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

  const fetchPostDetails = async () => {
    try {
      const res = await api.get(`/posts/${slug}`);
      if (res.data.success) {
        setPost(res.data.data);
        setUpvotes(res.data.data.upvotesCount);
        
        // Fetch comments
        const commentsRes = await api.get(`/comments/post/${res.data.data._id}`);
        if (commentsRes.data.success) {
          setComments(commentsRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
    } finally {
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [slug]);

  const handleUpvote = async () => {
    if (!post) return;
    try {
      const res = await api.post(`/posts/${post._id}/upvote`);
      if (res.data.success) {
        setUpvoted(res.data.upvoted);
        setUpvotes(res.data.upvotesCount);
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newCommentVal.trim()) return;

    setSubmittingComment(true);
    try {
      const payload: any = {
        postId: post._id,
        content: newCommentVal
      };
      if (replyingToId) {
        payload.parentCommentId = replyingToId;
      }

      const res = await api.post('/comments', payload);
      if (res.data.success) {
        setComments(prev => [...prev, res.data.data]);
        setNewCommentVal('');
        setReplyingToId(null);
      }
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleMarkSolution = async (commentId: string) => {
    try {
      const res = await api.put(`/comments/${commentId}/solution`);
      if (res.data.success) {
        // Update comments local states
        setComments(prev => prev.map(c => {
          if (c._id === commentId) return { ...c, isSolution: true };
          return { ...c, isSolution: false };
        }));
      }
    } catch (err) {
      console.error('Error marking solution:', err);
    }
  };

  const handleTriggerAISummary = async () => {
    if (!post) return;
    setLoadingAI(true);
    try {
      const endpoint = post.type === 'research' 
        ? `/ai/research/${post.researchDetails?._id}/summarize`
        : `/ai/post/${post._id}/summarize`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setAiSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error('AI summary failed:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Build recursive comment list display
  const renderCommentNode = (comment: Comment, depth = 0) => {
    const isSolutionOption = post?.type === 'question' && user?.id === post.author._id && !comment.parentComment;
    
    return (
      <div 
        key={comment._id} 
        className={`p-4 border border-border rounded-lg bg-card space-y-2 relative transition-all ${
          comment.isSolution ? 'border-success ring-1 ring-success/20 bg-success/[0.01]' : ''
        }`}
        style={{ marginLeft: `${Math.min(depth * 20, 80)}px` }}
      >
        {/* Solution badge */}
        {comment.isSolution && (
          <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
            <Check className="h-3 w-3 mr-1" />
            Accepted Solution
          </span>
        )}

        {/* Comment author bar */}
        <div className="flex items-center space-x-2">
          {comment.author.profilePicture ? (
            <img
              src={comment.author.profilePicture}
              alt={comment.author.name}
              className="h-6 w-6 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-text-primary text-[10px] font-bold flex items-center justify-center uppercase">
              {comment.author.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold text-text-primary">
            {comment.author.name}
          </span>
          <span className="text-[9px] text-text-secondary">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Text */}
        <p className="text-xs text-text-secondary leading-relaxed">
          {comment.content}
        </p>

        {/* Action triggers */}
        <div className="flex items-center space-x-3 text-[10px] text-text-secondary pt-1">
          <button 
            onClick={() => setReplyingToId(comment._id)}
            className="hover:text-accent font-medium"
          >
            Reply
          </button>
          
          {isSolutionOption && !comment.isSolution && (
            <button
              onClick={() => handleMarkSolution(comment._id)}
              className="text-success hover:underline font-medium"
            >
              Mark Accepted Solution
            </button>
          )}
        </div>
      </div>
    );
  };

  // Sort and build comments hierarchy list
  const getSortedComments = () => {
    // 1. Group solutions first, then sort replies under parents
    const roots = comments.filter(c => !c.parentComment);
    const sortedList: Array<{ comment: Comment; depth: number }> = [];

    const getRepliesFor = (parentId: string, depth: number) => {
      comments
        .filter(c => c.parentComment === parentId)
        .forEach(reply => {
          sortedList.push({ comment: reply, depth });
          getRepliesFor(reply._id, depth + 1);
        });
    };

    // Sort solutions to top
    roots
      .sort((a, b) => (a.isSolution ? -1 : b.isSolution ? 1 : 0))
      .forEach(root => {
        sortedList.push({ comment: root, depth: 0 });
        getRepliesFor(root._id, 1);
      });

    return sortedList;
  };

  if (loadingPost) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <Card className="text-center py-12">
        <h4 className="font-bold text-text-primary text-sm">Post not found</h4>
        <p className="text-xs text-text-secondary mt-1">This post has been archived or deleted.</p>
        <Link to="/feed" className="text-xs text-accent font-bold mt-4 inline-block hover:underline">
          Back to Feed
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
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

      {/* Main post contents */}
      <div className="lg:col-span-3 space-y-6">
        
        <div className="space-y-4">
          {/* Post Header */}
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl font-extrabold text-text-primary leading-tight flex-1">
                {post.title}
              </h1>
              
              <div className="relative shrink-0 pt-1">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors border border-border"
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
                    <div className="absolute right-0 top-9 w-44 bg-card border border-border rounded-md shadow-lg py-1 z-20 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-100">
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
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                {post.author.profilePicture ? (
                  <img
                    src={getImageUrl(post.author.profilePicture)}
                    alt={post.author.name}
                    className="h-6 w-6 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-text-primary text-[10px] font-bold flex items-center justify-center uppercase">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-text-primary">{post.author.name}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{post.readingTime} min read</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center space-x-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{post.viewsCount} views</span>
              </div>
              <span className="text-border">|</span>
              <span>Published in {typeof post.field === 'object' ? post.field.name : 'Unknown Field'}</span>
            </div>
          </div>

          {/* Dynamic Type-specific fields panels */}
          {post.type === 'research' && post.researchDetails && (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Academic Paper Specs
                </h4>
                {post.researchDetails.isApproved ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50 text-[10px] font-semibold">
                    Approved Paper
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50 text-[10px] font-semibold">
                    Pending Approval Review
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 text-xs text-text-secondary">
                {post.researchDetails.authors.length > 0 && (
                  <div>
                    <strong className="text-text-primary">Authors:</strong> {post.researchDetails.authors.join(', ')}
                  </div>
                )}
                {post.researchDetails.institution && (
                  <div>
                    <strong className="text-text-primary">Institution:</strong> {post.researchDetails.institution}
                  </div>
                )}
                {post.researchDetails.publication && (
                  <div>
                    <strong className="text-text-primary">Journal / Publisher:</strong> {post.researchDetails.publication}
                  </div>
                )}
                {post.researchDetails.doi && (
                  <div>
                    <strong className="text-text-primary">DOI:</strong> {post.researchDetails.doi}
                  </div>
                )}
              </div>

              {post.researchDetails.abstract && (
                <div className="pt-2 border-t border-border mt-2">
                  <h5 className="text-xs font-semibold text-text-primary mb-1">Abstract Summary</h5>
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    {post.researchDetails.abstract}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-3">
                {post.researchDetails.githubRepo && (
                  <a
                    href={post.researchDetails.githubRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Repository</span>
                  </a>
                )}
                {post.researchDetails.pdfUrl && (
                  <a
                    href={post.researchDetails.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Download PDF Paper</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {post.type === 'project' && post.projectDetails && (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Project Specs
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  post.projectDetails.difficulty === 'hard' ? 'bg-red-50 text-red-700 border border-red-200' :
                  post.projectDetails.difficulty === 'medium' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {post.projectDetails.difficulty} Level
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {post.projectDetails.techStack.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-text-primary block">Tech Stack</span>
                    <div className="flex flex-wrap gap-1">
                      {post.projectDetails.techStack.map((tech: string, idx: number) => (
                        <span key={idx} className="bg-card border border-border px-2 py-0.5 rounded font-mono text-text-secondary text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {post.projectDetails.installation && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-text-primary block">Quick Setup Command</span>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded border border-slate-800 font-mono text-[10px] overflow-x-auto">
                      <code>{post.projectDetails.installation}</code>
                    </pre>
                  </div>
                )}
              </div>

              {post.projectDetails.architecture && (
                <div className="space-y-1.5 pt-3 border-t border-border">
                  <span className="font-semibold text-text-primary text-xs block">Architecture Flowchart</span>
                  {/* Wrap flowchart code in markdown syntax block for custom renderer */}
                  <MarkdownRenderer content={`\`\`\`mermaid\n${post.projectDetails.architecture}\n\`\`\``} />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {post.projectDetails.github && (
                  <a
                    href={post.projectDetails.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    <FaGithub className="h-4 w-4" />
                    <span>Source Repository</span>
                  </a>
                )}
                {post.projectDetails.demo && (
                  <a
                    href={post.projectDetails.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Live Interactive Demo</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {post.type === 'resource' && post.resourceDetails && (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-5 space-y-3 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded border border-border text-[9px] font-mono text-text-secondary uppercase">
                    {post.resourceDetails.resourceType}
                  </span>
                  
                  {/* Rating stars */}
                  <div className="flex text-amber-500">
                    {Array.from({ length: post.resourceDetails.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-text-secondary leading-relaxed max-w-lg">
                  {post.resourceDetails.description || 'Verified educational resource curated for the community.'}
                </p>
              </div>

              <a
                href={post.resourceDetails.url}
                target="_blank"
                rel="noreferrer"
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors"
              >
                <span>Access Resource</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Post Markdown Body */}
          <div className="py-4 border-b border-border space-y-4">
            <MarkdownRenderer content={post.content} />

            {/* Responsive Image Gallery */}
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-3 mt-4 ${
                post.images.length === 1 
                  ? 'grid-cols-1' 
                  : post.images.length === 2 
                  ? 'grid-cols-2' 
                  : 'grid-cols-3'
              }`}>
                {post.images.map((imgUrl, index) => (
                  <div 
                    key={index} 
                    onClick={() => setActiveLightbox(getImageUrl(imgUrl))}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border bg-slate-50 dark:bg-slate-900 cursor-zoom-in group"
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
          </div>

          {/* Post Interactions Footer */}
          <div className="flex items-center space-x-4 py-2 border-b border-border">
            <button
              onClick={handleUpvote}
              className={`flex items-center space-x-1 text-xs hover:text-accent transition-colors py-1.5 px-3 rounded-md border ${
                upvoted ? 'text-accent bg-accent/5 border-accent/15 font-semibold' : 'border-border'
              }`}
            >
              <ArrowUp className="h-4.5 w-4.5" />
              <span>{upvotes} Upvotes</span>
            </button>

            <span className="text-xs text-text-secondary flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length} Comments</span>
            </span>
          </div>

          {/* Comments Discussion Section */}
          <div id="comments" className="space-y-6 pt-4">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
              Discussion Board
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              {replyingToId && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 border border-border px-3 py-1.5 rounded text-xs text-text-secondary">
                  <span>Replying to nested comment</span>
                  <button 
                    type="button" 
                    onClick={() => setReplyingToId(null)}
                    className="text-danger hover:underline"
                  >
                    Cancel Reply
                  </button>
                </div>
              )}
              <textarea
                value={newCommentVal}
                onChange={(e) => setNewCommentVal(e.target.value)}
                placeholder="Share your review, answer, or code improvements..."
                rows={3}
                className="w-full p-3 text-sm bg-card text-text-primary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" loading={submittingComment} className="text-xs">
                  <Send className="h-3 w-3 mr-1.5" />
                  Post Comment
                </Button>
              </div>
            </form>

            {/* Flat Nested list */}
            {comments.length > 0 ? (
              <div className="space-y-3.5">
                {getSortedComments().map(({ comment, depth }) => renderCommentNode(comment, depth))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary italic">
                No replies or reviews yet. Start the academic discussion.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Side widgets panel (AI Summarizer triggers) */}
      <div className="space-y-6">
        
        {/* AI Assistant panel */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-border pb-2.5">
            <Sparkles className="h-4.5 w-4.5 text-accent" />
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              AI Study Assistant
            </h4>
          </div>

          {!aiSummary ? (
            <div className="space-y-3 text-center py-2">
              <p className="text-xs text-text-secondary leading-relaxed">
                Generate a fast, professional summary highlighting core insights and findings of this post.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerAISummary}
                loading={loadingAI}
                className="w-full"
              >
                Generate Summary
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs">
                <MarkdownRenderer content={aiSummary} />
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="text-[10px] text-accent hover:underline font-semibold"
              >
                Clear AI Summary
              </button>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};
export default PostDetail;
