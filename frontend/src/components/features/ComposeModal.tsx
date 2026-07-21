import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, Eye, Edit2, Upload, Trash2, ArrowLeft, ArrowRight, Check, Search, Plus 
} from 'lucide-react';
import { setComposeOpen } from '../../store/uiSlice';
import api from '../../services/api';
import type { Field, PostType } from '../../types';
import type { RootState } from '../../store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { getImageUrl } from '../../utils/image';

export const ComposeModal: React.FC = () => {
  const dispatch = useDispatch();
  const editPostData = useSelector((state: RootState) => state.ui.editPostData);
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [lastFiles, setLastFiles] = useState<FileList | null>(null);

  // 1. Post Meta States
  const [type, setType] = useState<PostType>('insight');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [tagsVal, setTagsVal] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  
  // Custom Field Autocomplete States
  const [fieldSearch, setFieldSearch] = useState('');
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [isCreatingField, setIsCreatingField] = useState(false);

  // Multiple Image Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Tab toggle for Markdown Editor
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');

  // 3. Dynamic Type-Specific States
  // Research Details
  const [abstract, setAbstract] = useState('');
  const [doi, setDoi] = useState('');
  const [publication, setPublication] = useState('');
  const [institution, setInstitution] = useState('');
  const [authorsVal, setAuthorsVal] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [researchGit, setResearchGit] = useState('');

  // Project Details
  const [architecture, setArchitecture] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [projectDemo, setProjectDemo] = useState('');
  const [projectGit, setProjectGit] = useState('');
  const [installation, setInstallation] = useState('');
  const [techStackVal, setTechStackVal] = useState('');

  // Resource Details
  const [resourceType, setResourceType] = useState<'book' | 'course' | 'documentation' | 'dataset' | 'cheatsheet' | 'interview_q' | 'github' | 'paper' | 'tool'>('book');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceRating, setResourceRating] = useState(5);
  const [resourceDesc, setResourceDesc] = useState('');

  // Draft Load
  useEffect(() => {
    if (editPostData) {
      if (editPostData.title) setTitle(editPostData.title);
      if (editPostData.content) setContent(editPostData.content);
      if (editPostData.type) setType(editPostData.type);
      if (editPostData.tags) setTagsVal(editPostData.tags.join(', '));
      if (editPostData.field) {
        const fId = typeof editPostData.field === 'object' ? editPostData.field._id : editPostData.field;
        setFieldId(fId);
      }
      if (editPostData.images) setUploadedImages(editPostData.images);
      if (editPostData.status) setStatus(editPostData.status);

      // Sub-details
      if (editPostData.type === 'research' && editPostData.researchDetails) {
        const rd = editPostData.researchDetails;
        if (rd.abstract) setAbstract(rd.abstract);
        if (rd.doi) setDoi(rd.doi);
        if (rd.publication) setPublication(rd.publication);
        if (rd.institution) setInstitution(rd.institution);
        if (rd.authors) setAuthorsVal(rd.authors.join(', '));
        if (rd.pdfUrl) setPdfUrl(rd.pdfUrl);
        if (rd.githubRepo) setResearchGit(rd.githubRepo);
      } else if (editPostData.type === 'project' && editPostData.projectDetails) {
        const pd = editPostData.projectDetails;
        if (pd.architecture) setArchitecture(pd.architecture);
        if (pd.difficulty) setDifficulty(pd.difficulty);
        if (pd.isOpenSourceContribution !== undefined) setIsOpenSource(pd.isOpenSourceContribution);
        if (pd.demo) setProjectDemo(pd.demo);
        if (pd.github) setProjectGit(pd.github);
        if (pd.installation) setInstallation(pd.installation);
        if (pd.techStack) setTechStackVal(pd.techStack.join(', '));
      } else if (editPostData.type === 'resource' && editPostData.resourceDetails) {
        const red = editPostData.resourceDetails;
        if (red.resourceType) setResourceType(red.resourceType);
        if (red.url) setResourceUrl(red.url);
        if (red.rating !== undefined) setResourceRating(red.rating);
        if (red.description) setResourceDesc(red.description);
      }
    } else {
      const saved = localStorage.getItem('prizm_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.content) setContent(parsed.content);
          if (parsed.type) setType(parsed.type);
          if (parsed.tagsVal) setTagsVal(parsed.tagsVal);
          if (parsed.fieldId) setFieldId(parsed.fieldId);
          if (parsed.uploadedImages) setUploadedImages(parsed.uploadedImages);
          
          if (parsed.abstract) setAbstract(parsed.abstract);
          if (parsed.doi) setDoi(parsed.doi);
          if (parsed.publication) setPublication(parsed.publication);
          if (parsed.institution) setInstitution(parsed.institution);
          if (parsed.authorsVal) setAuthorsVal(parsed.authorsVal);
          if (parsed.pdfUrl) setPdfUrl(parsed.pdfUrl);
          if (parsed.researchGit) setResearchGit(parsed.researchGit);
          if (parsed.architecture) setArchitecture(parsed.architecture);
          if (parsed.difficulty) setDifficulty(parsed.difficulty);
          if (parsed.isOpenSource) setIsOpenSource(parsed.isOpenSource);
          if (parsed.projectDemo) setProjectDemo(parsed.projectDemo);
          if (parsed.projectGit) setProjectGit(parsed.projectGit);
          if (parsed.installation) setInstallation(parsed.installation);
          if (parsed.techStackVal) setTechStackVal(parsed.techStackVal);
          if (parsed.resourceType) setResourceType(parsed.resourceType);
          if (parsed.resourceUrl) setResourceUrl(parsed.resourceUrl);
          if (parsed.resourceRating) setResourceRating(parsed.resourceRating);
          if (parsed.resourceDesc) setResourceDesc(parsed.resourceDesc);
        } catch (e) {
          console.warn('Could not restore draft:', e);
        }
      }
    }
  }, [editPostData]);

  // Draft Autosave
  useEffect(() => {
    if (title || content || tagsVal || uploadedImages.length > 0) {
      localStorage.setItem(
        'prizm_draft',
        JSON.stringify({
          title, content, type, tagsVal, fieldId, uploadedImages,
          abstract, doi, publication, institution, authorsVal, pdfUrl, researchGit,
          architecture, difficulty, isOpenSource, projectDemo, projectGit, installation, techStackVal,
          resourceType, resourceUrl, resourceRating, resourceDesc
        })
      );
    }
  }, [
    title, content, type, tagsVal, fieldId, uploadedImages,
    abstract, doi, publication, institution, authorsVal, pdfUrl, researchGit,
    architecture, difficulty, isOpenSource, projectDemo, projectGit, installation, techStackVal,
    resourceType, resourceUrl, resourceRating, resourceDesc
  ]);

  // Fetch field categories on mounting
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await api.get('/fields');
        if (res.data.success) {
          setFields(res.data.data);
          
          // Populate the search field if a field was restored from draft or edit data
          let selectFieldId = '';
          if (editPostData && editPostData.field) {
            selectFieldId = typeof editPostData.field === 'object' ? editPostData.field._id : editPostData.field;
          } else {
            const saved = localStorage.getItem('prizm_draft');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.fieldId) selectFieldId = parsed.fieldId;
            }
          }

          if (selectFieldId) {
            const matched = res.data.data.find((f: Field) => f._id === selectFieldId);
            if (matched) {
              setFieldSearch(matched.hierarchyPath || matched.name);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching fields:', err);
      } finally {
        setLoadingFields(false);
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim() || !fieldId) {
      setError('Title, Content, and Field category are required fields');
      return;
    }

    setSubmitLoading(true);

    // Build payload
    const payload: any = {
      type,
      title,
      content,
      fieldId,
      status,
      tags: tagsVal.split(',').map(t => t.trim()).filter(Boolean),
      images: uploadedImages
    };

    // Append dynamic sub-documents
    if (type === 'research') {
      payload.researchDetails = {
        abstract,
        doi,
        publication,
        institution,
        authors: authorsVal.split(',').map(a => a.trim()).filter(Boolean),
        pdfUrl,
        githubRepo: researchGit
      };
    } else if (type === 'project') {
      payload.projectDetails = {
        architecture,
        difficulty,
        isOpenSourceContribution: isOpenSource,
        demo: projectDemo,
        github: projectGit,
        installation,
        techStack: techStackVal.split(',').map(t => t.trim()).filter(Boolean)
      };
    } else if (type === 'resource') {
      payload.resourceDetails = {
        resourceType,
        url: resourceUrl,
        rating: resourceRating,
        description: resourceDesc
      };
    }

    try {
      const res = editPostData 
        ? await api.put(`/posts/${editPostData._id}`, payload)
        : await api.post('/posts', payload);

      if (res.data.success) {
        localStorage.removeItem('prizm_draft');
        dispatch(setComposeOpen(false));
        // Refresh page to load new posts
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish post');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateCustomField = async () => {
    if (!fieldSearch.trim() || isCreatingField) return;
    setIsCreatingField(true);
    try {
      const res = await api.post('/fields', { name: fieldSearch.trim() });
      if (res.data.success) {
        const newField = res.data.data;
        setFields(prev => {
          if (prev.some(f => f._id === newField._id)) return prev;
          return [...prev, newField];
        });
        setFieldId(newField._id);
        setFieldSearch(newField.name);
        setShowFieldDropdown(false);
      }
    } catch (err: any) {
      console.error('Failed to create custom field:', err);
      setError(err.response?.data?.error || 'Failed to create field');
    } finally {
      setIsCreatingField(false);
    }
  };

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
  };

  const uploadFiles = async (fileList: FileList) => {
    setLastFiles(fileList);
    setUploadingImages(true);
    setUploadError('');
    try {
      const formData = new FormData();
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Format not supported: ${file.name}. Only PNG, JPG, JPEG, WEBP, and GIF are allowed.`);
        }
        formData.append('files', file);
      }
      
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setUploadedImages(prev => [...prev, ...res.data.urls]);
      }
    } catch (err: any) {
      console.error('Failed to upload images:', err);
      setUploadError(err.response?.data?.error || err.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRetryUpload = () => {
    if (lastFiles) {
      uploadFiles(lastFiles);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...uploadedImages];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      setUploadedImages(newImages);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <span className="h-6 w-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
              +
            </span>
            <h3 className="font-bold text-text-primary text-base">{editPostData ? 'Edit Contribution' : 'Share Knowledge'}</h3>
          </div>
          <button 
            onClick={() => dispatch(setComposeOpen(false))} 
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm font-medium">
              {error}
            </div>
          )}

          {/* Post Type Selector tabs */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Post Type
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
              {(['insight', 'research', 'tutorial', 'project', 'question', 'resource', 'news'] as PostType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    type === t
                      ? 'bg-card text-text-primary shadow-sm border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid fields for Title, Field selector, and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name your post or query"
                required
              />
            </div>
            
            <div className="relative">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider block mb-1.5">
                Field Category
              </label>
              {loadingFields ? (
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
              ) : (
                <>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      value={fieldSearch}
                      onChange={(e) => {
                        setFieldSearch(e.target.value);
                        setShowFieldDropdown(true);
                      }}
                      onFocus={() => setShowFieldDropdown(true)}
                      placeholder="Search or type custom field..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-card text-text-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {showFieldDropdown && (
                    <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border rounded-md shadow-lg z-50">
                      {fields
                        .filter(f => (f.hierarchyPath || f.name).toLowerCase().includes(fieldSearch.toLowerCase()))
                        .map(f => (
                          <button
                            key={f._id}
                            type="button"
                            onClick={() => {
                              setFieldId(f._id);
                              setFieldSearch(f.hierarchyPath || f.name);
                              setShowFieldDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary flex items-center justify-between"
                          >
                            <span>{f.hierarchyPath || f.name}</span>
                            {fieldId === f._id && <Check className="h-3.5 w-3.5 text-accent" />}
                          </button>
                        ))
                      }
                      
                      {fieldSearch.trim() && !fields.some(f => f.name.toLowerCase() === fieldSearch.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={handleCreateCustomField}
                          disabled={isCreatingField}
                          className="w-full text-left px-4 py-2.5 text-xs bg-accent/5 hover:bg-accent/15 text-accent font-semibold border-t border-border flex items-center space-x-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{isCreatingField ? 'Creating...' : `Create custom field "${fieldSearch.trim()}"`}</span>
                        </button>
                      )}

                      <div className="border-t border-border bg-slate-50 dark:bg-slate-900/40 p-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowFieldDropdown(false)}
                          className="px-2 py-0.5 text-[10px] text-text-secondary hover:text-text-primary"
                        >
                          Close List
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Dynamic Content (Markdown editor + live preview) */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Content (Markdown Supported)
              </label>
              <div className="flex border border-border rounded-md overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setEditorTab('edit')}
                  className={`flex items-center space-x-1.5 px-3 py-1 ${
                    editorTab === 'edit'
                      ? 'bg-slate-100 dark:bg-slate-900 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`flex items-center space-x-1.5 px-3 py-1 ${
                    editorTab === 'preview'
                      ? 'bg-slate-100 dark:bg-slate-900 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {editorTab === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Markdown equations $\\sum_{i=1}^n x_i$, Mermaid blocks, or standard guides..."
                rows={10}
                className="w-full p-3 text-sm bg-card text-text-primary border border-border rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            ) : (
              <div className="border border-border rounded-lg p-4 min-h-[224px] bg-slate-50 dark:bg-slate-900/40">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <span className="text-xs text-text-secondary italic">Nothing to preview yet</span>
                )}
              </div>
            )}
          </div>

          {/* Dynamic sub-fields for Research Paper */}
          {type === 'research' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border space-y-4 animate-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Research Metadata</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Authors (Comma-separated)"
                  value={authorsVal}
                  onChange={(e) => setAuthorsVal(e.target.value)}
                  placeholder="e.g. John Doe, Jane Smith"
                />
                <Input
                  label="DOI"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="e.g. 10.1145/3318464.3389700"
                />
                <Input
                  label="Institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. MIT, Stanford University"
                />
                <Input
                  label="Publication / Journal"
                  value={publication}
                  onChange={(e) => setPublication(e.target.value)}
                  placeholder="e.g. IEEE S&P, ACM SIGMOD"
                />
                <Input
                  label="PDF Link (Cloudinary or External URL)"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="e.g. https://arxiv.org/pdf/..."
                />
                <Input
                  label="GitHub Repository Link"
                  value={researchGit}
                  onChange={(e) => setResearchGit(e.target.value)}
                  placeholder="e.g. https://github.com/user/project"
                />
              </div>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Paste research paper abstract summary here..."
                rows={4}
                className="w-full p-2.5 text-sm bg-card text-text-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          {/* Dynamic sub-fields for Projects */}
          {type === 'project' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border space-y-4 animate-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Project Specification</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wider block mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-card text-text-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="easy">Easy (Beginner)</option>
                    <option value="medium">Medium (Intermediate)</option>
                    <option value="hard">Hard (Advanced)</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Tech Stack (Comma-separated tags)"
                    value={techStackVal}
                    onChange={(e) => setTechStackVal(e.target.value)}
                    placeholder="e.g. React, Node, Express, MongoDB"
                  />
                </div>

                <Input
                  label="GitHub Repo Link"
                  value={projectGit}
                  onChange={(e) => setProjectGit(e.target.value)}
                  placeholder="e.g. https://github.com/..."
                />
                
                <Input
                  label="Live Demo Link"
                  value={projectDemo}
                  onChange={(e) => setProjectDemo(e.target.value)}
                  placeholder="e.g. https://myproject.vercel.app"
                />

                <Input
                  label="Installation Command"
                  value={installation}
                  onChange={(e) => setInstallation(e.target.value)}
                  placeholder="e.g. npm install && npm run dev"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOpenSource"
                  checked={isOpenSource}
                  onChange={(e) => setIsOpenSource(e.target.checked)}
                  className="rounded text-accent focus:ring-accent h-4 w-4 border-border"
                />
                <label htmlFor="isOpenSource" className="text-xs text-text-secondary select-none">
                  Open for open-source contributions
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wider block mb-1.5">
                  Architecture Flowchart (Mermaid syntax)
                </label>
                <textarea
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  placeholder="graph TD;&#10;  A[Client] --> B[Server];"
                  rows={3}
                  className="w-full p-2.5 text-sm bg-card text-text-primary border border-border rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          {/* Dynamic sub-fields for Resources */}
          {type === 'resource' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border space-y-4 animate-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Resource Library Catalog</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wider block mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-card text-text-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="book">Book</option>
                    <option value="course">Course</option>
                    <option value="documentation">Documentation</option>
                    <option value="dataset">Dataset</option>
                    <option value="cheatsheet">Cheat Sheet</option>
                    <option value="interview_q">Interview Questions</option>
                    <option value="github">Github Repository</option>
                    <option value="paper">Academic Paper</option>
                    <option value="tool">Developer Tool</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Resource URL"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="e.g. https://www.coursera.org/..."
                    required
                  />
                </div>

                <Input
                  label="Rating (0 - 5)"
                  type="number"
                  min={0}
                  max={5}
                  value={resourceRating}
                  onChange={(e) => setResourceRating(parseInt(e.target.value, 10))}
                />
              </div>
              <textarea
                value={resourceDesc}
                onChange={(e) => setResourceDesc(e.target.value)}
                placeholder="Brief description of the resource value..."
                rows={3}
                className="w-full p-2.5 text-sm bg-card text-text-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          {/* Dynamic Images Upload section */}
          <div className="flex flex-col space-y-1.5 border-t border-border pt-4">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Upload Images (Supports JPG, PNG, WEBP, GIF)
            </label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-150 ${
                dragOver 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border hover:border-text-secondary/50 hover:bg-slate-50 dark:hover:bg-slate-900/10'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImagesSelect} 
                multiple 
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                className="hidden" 
              />
              {uploadingImages ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2 animate-pulse">
                  <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-accent">Uploading assets to Cloudinary...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-text-secondary mx-auto mb-2" />
                  <p className="text-xs text-text-primary font-medium">
                    Click to select or drag and drop images here
                  </p>
                  <p className="text-[10px] text-text-secondary mt-1">
                    You can upload multiple files up to 10MB each. Reorder using arrow controls.
                  </p>
                </>
              )}
            </div>

            {/* Upload Failure Message & Retry */}
            {uploadError && (
              <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-danger text-[11px] flex justify-between items-center mt-2 animate-in slide-in-from-top-1 duration-150">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={handleRetryUpload}
                  className="underline text-[10px] font-bold text-accent hover:text-accent-hover uppercase tracking-wider shrink-0 ml-4"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Uploaded Gallery Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {uploadedImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-md overflow-hidden border border-border bg-slate-100 dark:bg-slate-900/60 aspect-video">
                    <img 
                      src={getImageUrl(url)} 
                      alt={`Upload preview ${idx}`} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'left'); }}
                          className="p-1.5 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-text-primary transition-colors"
                          title="Move left"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                      )}
                      {idx < uploadedImages.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'right'); }}
                          className="p-1.5 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-text-primary transition-colors"
                          title="Move right"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="p-1.5 bg-danger text-white hover:bg-danger/90 rounded transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags & Settings bar */}
          <div className="border-t border-border pt-4">
            <Input
              label="Tags (Comma-separated)"
              value={tagsVal}
              onChange={(e) => setTagsVal(e.target.value)}
              placeholder="e.g. react19, cryptography, cleanarchitecture"
            />
          </div>
        </form>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs bg-transparent text-text-secondary border border-border rounded px-2 py-1 focus:outline-none"
            >
              <option value="published">Publish Now</option>
              <option value="draft">Save Draft</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => dispatch(setComposeOpen(false))}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              type="button"
              onClick={handleSubmit}
              loading={submitLoading}
            >
              {editPostData ? 'Save Changes' : (status === 'draft' ? 'Save Draft' : 'Publish Content')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ComposeModal;
