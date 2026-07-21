import React, { useEffect, useState } from 'react';
import { 
  Users as UsersIcon, ShieldAlert, FileCheck, BarChart2, Check, 
  AlertTriangle, Edit, Trash2, GitMerge
} from 'lucide-react';
import api from '../services/api';
import type { User, Report, Field } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'research' | 'moderation' | 'users' | 'fields'>('research');
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Lists states
  const [pendingResearch, setPendingResearch] = useState<any[]>([]);
  const [loadingResearch, setLoadingResearch] = useState(true);

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  // Field Management States
  const [fieldsList, setFieldsList] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  
  // Edit field states
  const [renameFieldId, setRenameFieldId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  
  // Merge field states
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [submittingFieldAction, setSubmittingFieldAction] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchPendingResearch = async () => {
    setLoadingResearch(true);
    try {
      // Fetch posts of type 'research' that are in draft or not approved
      const res = await api.get('/posts?type=research');
      if (res.data.success) {
        // Filter those whose research details are not approved
        const items = res.data.data as any[];
        setPendingResearch(items.filter(p => p.researchDetails && !p.researchDetails.isApproved));
      }
    } catch (err) {
      console.error('Error fetching pending research papers:', err);
    } finally {
      setLoadingResearch(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('/admin/reports?status=pending');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Error loading moderation report queue:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading users moderation list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const res = await api.get('/fields');
      if (res.data.success) {
        setFieldsList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching fields list:', err);
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchPendingResearch();
    fetchReports();
    fetchUsers();
    fetchFields();
  }, []);

  const handleRenameField = async (id: string) => {
    if (!renameValue.trim()) return;
    setSubmittingFieldAction(true);
    try {
      const res = await api.put(`/admin/fields/${id}`, { name: renameValue.trim() });
      if (res.data.success) {
        setFieldsList(prev => prev.map(f => f._id === id ? { ...f, name: res.data.data.name, slug: res.data.data.slug } : f));
        setRenameFieldId(null);
        setRenameValue('');
      }
    } catch (err) {
      console.error('Error renaming field:', err);
    } finally {
      setSubmittingFieldAction(false);
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field category? All associated posts will be permanently removed!')) return;
    setSubmittingFieldAction(true);
    try {
      const res = await api.delete(`/admin/fields/${id}`);
      if (res.data.success) {
        setFieldsList(prev => prev.filter(f => f._id !== id));
      }
    } catch (err) {
      console.error('Error deleting field:', err);
    } finally {
      setSubmittingFieldAction(false);
    }
  };

  const handleMergeFields = async () => {
    if (!mergeSourceId || !mergeTargetId) return;
    setSubmittingFieldAction(true);
    try {
      const res = await api.post('/admin/fields/merge', {
        sourceFieldId: mergeSourceId,
        targetFieldId: mergeTargetId
      });
      if (res.data.success) {
        alert(res.data.message);
        setMergeSourceId(null);
        setMergeTargetId('');
        // Reload list and metrics
        fetchFields();
        fetchMetrics();
      }
    } catch (err) {
      console.error('Error merging fields:', err);
    } finally {
      setSubmittingFieldAction(false);
    }
  };

  const handleApproveResearch = async (researchDetailsId: string) => {
    try {
      const res = await api.put(`/admin/research/${researchDetailsId}/approve`);
      if (res.data.success) {
        setPendingResearch(prev => prev.filter(p => p.researchDetails?._id !== researchDetailsId));
        // Refresh metrics
        fetchMetrics();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed', actionTaken: string) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/resolve`, { status, actionTaken });
      if (res.data.success) {
        setReports(prev => prev.filter(r => r._id !== reportId));
        fetchMetrics();
      }
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
  };

  const handleUserStatusToggle = async (userId: string, newStatus: 'active' | 'suspended' | 'shadow_banned') => {
    setStatusLoadingId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.error('Failed to change user status:', err);
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h3 className="text-xl font-bold text-text-primary">Admin Control Center</h3>
        <p className="text-xs text-text-secondary">
          Manage system users, approve academic papers, moderate reported items and analyze metrics.
        </p>
      </div>

      {/* Grid metrics row */}
      {loadingMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center space-x-3.5 p-4">
            <span className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-500">
              <UsersIcon className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block font-semibold">Total Scholars</span>
              <span className="text-lg font-bold text-text-primary">{metrics?.totalUsers || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center space-x-3.5 p-4">
            <span className="p-2.5 rounded bg-green-50 dark:bg-green-950/20 text-green-500">
              <FileCheck className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block font-semibold">Published Posts</span>
              <span className="text-lg font-bold text-text-primary">{metrics?.totalPosts || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center space-x-3.5 p-4">
            <span className="p-2.5 rounded bg-red-50 dark:bg-red-950/20 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block font-semibold">Reports Queue</span>
              <span className="text-lg font-bold text-text-primary">{metrics?.pendingReports || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center space-x-3.5 p-4">
            <span className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-500">
              <BarChart2 className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block font-semibold">Pending papers</span>
              <span className="text-lg font-bold text-text-primary">{metrics?.pendingResearch || 0}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border flex space-x-6">
        <button
          onClick={() => setActiveTab('research')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'research' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Research Approvals ({pendingResearch.length})
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'moderation' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Reports Queue ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'users' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Scholars Directory ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'fields' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Fields Catalog ({fieldsList.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        
        {/* Research approvals Panel */}
        {activeTab === 'research' && (
          <div className="space-y-3">
            {loadingResearch ? (
              <Skeleton className="h-20 w-full" />
            ) : pendingResearch.length > 0 ? (
              pendingResearch.map((post) => (
                <Card key={post._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
                      Pending Approval
                    </span>
                    <h4 className="font-bold text-text-primary text-sm mt-1">{post.title}</h4>
                    <span className="text-[10px] text-text-secondary block">
                      Submitted by {post.author.name} • Institution: {post.researchDetails?.institution || 'N/A'}
                    </span>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <a
                      href={post.researchDetails?.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center border border-border px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      Verify PDF
                    </a>
                    
                    <Button
                      size="sm"
                      onClick={() => handleApproveResearch(post.researchDetails?._id)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve & Publish
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg">
                No pending research papers submitted.
              </div>
            )}
          </div>
        )}

        {/* Moderation Reports queue */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            {loadingReports ? (
              <Skeleton className="h-20 w-full" />
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      <span className="font-bold text-xs text-text-primary">
                        Reported {report.contentType}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      <strong className="text-text-primary font-semibold">Reason:</strong> {report.reason}
                    </p>
                    <span className="text-[10px] text-text-secondary block">
                      Reporter ID: {report.reporter.name} • Content Reference: {report.contentId}
                    </span>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveReport(report._id, 'dismissed', 'Content verified safe')}
                    >
                      Dismiss Report
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleResolveReport(report._id, 'resolved', 'Flagged content moderated')}
                    >
                      Moderate Content
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg">
                Moderation queue is clean.
              </div>
            )}
          </div>
        )}

        {/* Users Moderation list */}
        {activeTab === 'users' && (
          <Card className="p-0 border border-border overflow-hidden">
            {loadingUsers ? (
              <div className="p-4"><Skeleton className="h-10 w-full" /></div>
            ) : usersList.length > 0 ? (
              <div className="divide-y divide-border text-xs text-text-secondary">
                {usersList.map((usr) => (
                  <div key={usr._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <strong className="text-text-primary font-semibold text-sm">{usr.name}</strong>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-text-secondary">
                          {usr.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary block">
                        {usr.email} • {usr.reputation} Reputation pts • Account Status: <span className={`font-semibold capitalize ${
                          usr.status === 'suspended' ? 'text-danger' : 
                          usr.status === 'shadow_banned' ? 'text-warning' : 'text-success'
                        }`}>{usr.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {statusLoadingId === usr._id ? (
                        <span className="text-xs text-text-secondary animate-pulse">Updating status...</span>
                      ) : (
                        <select
                          value={usr.status}
                          onChange={(e) => handleUserStatusToggle(usr._id, e.target.value as any)}
                          className="bg-card border border-border rounded text-xs px-2.5 py-1 focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspend User</option>
                          <option value="shadow_banned">Shadow Ban</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary italic">
                Scholars database empty.
              </div>
            )}
          </Card>
        )}

        {/* Fields catalog management panel */}
        {activeTab === 'fields' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Merge Fields Tool Card */}
            <Card className="p-4 border border-border space-y-3 bg-slate-50 dark:bg-slate-900/30">
              <div className="flex items-center space-x-1.5 text-accent">
                <GitMerge className="h-4.5 w-4.5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Merge Duplicate Fields</h4>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Reassigns all published insights/posts referencing the source category to point to the target category, updating statistics and purging the source category safely.
              </p>
              
              <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-text-secondary block font-semibold">Source Field (To Delete)</label>
                  <select
                    value={mergeSourceId || ''}
                    onChange={(e) => setMergeSourceId(e.target.value || null)}
                    className="w-full text-xs px-2.5 py-1.5 bg-card text-text-primary border border-border rounded focus:outline-none"
                  >
                    <option value="">-- Choose Field --</option>
                    {fieldsList.map(f => (
                      <option key={f._id} value={f._id}>{f.name} ({f.postsCount} posts)</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-text-secondary block font-semibold">Target Field (To Retain)</label>
                  <select
                    value={mergeTargetId}
                    onChange={(e) => setMergeTargetId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-card text-text-primary border border-border rounded focus:outline-none"
                  >
                    <option value="">-- Choose Field --</option>
                    {fieldsList
                      .filter(f => f._id !== mergeSourceId)
                      .map(f => (
                        <option key={f._id} value={f._id}>{f.name}</option>
                      ))
                    }
                  </select>
                </div>

                <Button
                  onClick={handleMergeFields}
                  disabled={submittingFieldAction || !mergeSourceId || !mergeTargetId}
                  size="sm"
                >
                  Merge Categories
                </Button>
              </div>
            </Card>

            {/* List Catalog of Fields */}
            <Card className="p-0 border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Field Directory Details</h4>
                <span className="text-[10px] text-text-secondary">{fieldsList.length} Categories Registered</span>
              </div>

              {loadingFields ? (
                <div className="p-4"><Skeleton className="h-10 w-full" /></div>
              ) : fieldsList.length > 0 ? (
                <div className="divide-y divide-border text-xs text-text-secondary">
                  {fieldsList.map(f => (
                    <div key={f._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1 pr-4">
                        {renameFieldId === f._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="text-xs px-2.5 py-1 bg-card text-text-primary border border-border rounded focus:outline-none"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleRenameField(f._id)}
                              disabled={submittingFieldAction}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setRenameFieldId(null); setRenameValue(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <strong className="text-text-primary font-bold text-sm">{f.name}</strong>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded font-mono">
                              /{f.slug}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-text-secondary">{f.description}</p>
                        
                        {/* Usage Stats details */}
                        <div className="flex items-center space-x-4 text-[10px] text-text-secondary font-medium">
                          <span>{f.postsCount} Contributions/Posts</span>
                          <span>{f.followersCount} Scholar Followers</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-center">
                        <button
                          onClick={() => { setRenameFieldId(f._id); setRenameValue(f.name); }}
                          className="p-1.5 border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary rounded transition-colors"
                          title="Rename Category"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(f._id)}
                          className="p-1.5 border border-border hover:bg-danger/10 hover:border-danger/30 text-text-secondary hover:text-danger rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-text-secondary italic">
                  No fields registered.
                </div>
              )}
            </Card>
          </div>
        )}

      </div>

    </div>
  );
};
export default AdminDashboard;
