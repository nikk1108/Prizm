import React, { useEffect, useState } from 'react';
import { Folder, FolderPlus, ArrowRight, Trash2, Library, BookOpen } from 'lucide-react';
import api from '../services/api';
import type { BookmarkCollection, Post } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import PostCard from '../components/features/PostCard';

export const Bookmarks: React.FC = () => {
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Creation states
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // 2. Navigation states
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      if (res.data.success) {
        setCollections(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const payload: any = { name: newFolderName.trim() };
      if (parentFolderId) {
        payload.parentCollectionId = parentFolderId;
      }

      const res = await api.post('/bookmarks', payload);
      if (res.data.success) {
        setCollections(prev => [...prev, res.data.data]);
        setNewFolderName('');
        setParentFolderId('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const res = await api.delete(`/bookmarks/${id}`);
      if (res.data.success) {
        setCollections(prev => prev.filter(c => c._id !== id));
        if (activeCollectionId === id) {
          setActiveCollectionId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  };

  // Build recursive directory structure tree
  const getSubfoldersFor = (parentId: string | null) => {
    return collections.filter(c => {
      if (parentId === null) {
        return c.parentCollection === null || c.parentCollection === undefined;
      }
      const parentRef = c.parentCollection;
      return typeof parentRef === 'object' && parentRef !== null 
        ? parentRef._id === parentId 
        : parentRef === parentId;
    });
  };

  const renderFolderTreeNode = (collection: BookmarkCollection) => {
    const isSelected = activeCollectionId === collection._id;
    const subfolders = getSubfoldersFor(collection._id);

    return (
      <div key={collection._id} className="space-y-1 ml-3.5">
        <div className="flex items-center justify-between group">
          <button
            onClick={() => setActiveCollectionId(collection._id)}
            className={`flex items-center space-x-2 text-xs py-1.5 px-2 rounded-md transition-colors w-full text-left ${
              isSelected 
                ? 'bg-accent/10 text-accent font-semibold' 
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{collection.name}</span>
          </button>
          
          <button
            onClick={() => handleDeleteFolder(collection._id)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 text-danger transition-all shrink-0"
            title="Delete Collection"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {subfolders.map(sub => renderFolderTreeNode(sub))}
      </div>
    );
  };

  const getActivePosts = (): Post[] => {
    if (!activeCollectionId) return [];
    const activeCol = collections.find(c => c._id === activeCollectionId);
    return activeCol ? activeCol.posts : [];
  };

  const getActiveCollectionName = () => {
    if (!activeCollectionId) return 'Root Archives';
    const activeCol = collections.find(c => c._id === activeCollectionId);
    return activeCol ? activeCol.name : 'Unknown';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Left panel: Directory Manager */}
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-border pb-2.5">
            <Library className="h-4.5 w-4.5 text-accent" />
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Bookmark Folders
            </h4>
          </div>

          {/* Root button */}
          <button
            onClick={() => setActiveCollectionId(null)}
            className={`flex items-center space-x-2 text-xs py-1.5 px-2.5 rounded-md transition-colors w-full text-left ${
              activeCollectionId === null 
                ? 'bg-accent/10 text-accent font-semibold' 
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Folder className="h-4 w-4" />
            <span>Root Archive</span>
          </button>

          {/* Directory Tree */}
          {loading ? (
            <div className="space-y-2 pl-3.5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {getSubfoldersFor(null).map(root => renderFolderTreeNode(root))}
            </div>
          )}
        </Card>

        {/* Create Folder Form */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-border pb-2.5">
            <FolderPlus className="h-4.5 w-4.5 text-accent" />
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Create Folder
            </h4>
          </div>

          <form onSubmit={handleCreateFolder} className="space-y-3">
            {error && (
              <div className="p-2 bg-danger/10 border border-danger/20 rounded text-danger text-[10px] font-medium">
                {error}
              </div>
            )}
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. AI research, React"
              className="text-xs py-1.5"
              required
            />
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-primary uppercase tracking-wider">
                Parent Folder
              </label>
              <select
                value={parentFolderId}
                onChange={(e) => setParentFolderId(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-card text-text-primary border border-border rounded focus:outline-none"
              >
                <option value="">None (Root)</option>
                {collections.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Button type="submit" loading={creating} className="w-full text-xs py-1.5">
              Create Folder
            </Button>
          </form>
        </Card>
      </div>

      {/* Right panel: bookmarked posts list */}
      <div className="md:col-span-3 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-1.5">
            <span>Saves Archive</span>
            <ArrowRight className="h-4 w-4 text-text-secondary" />
            <span className="text-accent">{getActiveCollectionName()}</span>
          </h3>
          <p className="text-xs text-text-secondary">
            Access, read, and manage posts stored inside your collections library.
          </p>
        </div>

        {activeCollectionId === null ? (
          /* Root overview details */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.map(col => (
              <Card 
                key={col._id} 
                hoverEffect
                onClick={() => setActiveCollectionId(col._id)}
                className="flex items-center space-x-3 p-4"
              >
                <span className="p-2.5 rounded-lg bg-accent/5 text-accent border border-accent/10">
                  <Folder className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary text-sm truncate">{col.name}</h4>
                  <span className="text-[10px] text-text-secondary block">
                    {col.posts.length} bookmarked items
                  </span>
                </div>
              </Card>
            ))}
            
            {collections.length === 0 && !loading && (
              <Card className="col-span-2 text-center py-12 flex flex-col items-center justify-center space-y-3">
                <BookOpen className="h-8 w-8 text-text-secondary animate-pulse" />
                <h4 className="font-bold text-text-primary text-sm">Library is empty</h4>
                <p className="text-xs text-text-secondary max-w-sm">
                  Create folders on the left panel, and click bookmark icons on feed posts to save links here.
                </p>
              </Card>
            )}
          </div>
        ) : (
          /* Selected Folder post list */
          <div className="space-y-4">
            {getActivePosts().length > 0 ? (
              getActivePosts().map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic bg-slate-50 dark:bg-slate-900/30 border border-dashed border-border rounded-lg">
                No bookmarked items inside this folder.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
export default Bookmarks;
