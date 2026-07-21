import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageSquare, UserPlus, CheckCircle } from 'lucide-react';
import api from '../services/api';
import type { Notification } from '../types';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        
        // Auto-mark notifications as read when opening page
        const unreadIds = res.data.data.filter((n: Notification) => !n.isRead).map((n: Notification) => n._id);
        if (unreadIds.length > 0) {
          await api.put('/notifications/read', { ids: unreadIds });
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-danger fill-current" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-accent fill-current" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-text-secondary" />;
    }
  };

  const getNotifMessage = (notif: Notification) => {
    const sender = <strong className="text-text-primary font-semibold">{notif.sender.name}</strong>;
    switch (notif.type) {
      case 'like':
        return <span>{sender} liked your post {notif.post && <Link to={`/posts/${notif.post.slug}`} className="text-accent hover:underline">"{notif.post.title}"</Link>}</span>;
      case 'comment':
        return <span>{sender} commented on your post {notif.post && <Link to={`/posts/${notif.post.slug}`} className="text-accent hover:underline">"{notif.post.title}"</Link>}</span>;
      case 'reply':
        return <span>{sender} replied to your comment thread on post {notif.post && <Link to={`/posts/${notif.post.slug}`} className="text-accent hover:underline">"{notif.post.title}"</Link>}</span>;
      case 'follow':
        return <span>{sender} started following your profile</span>;
      default:
        return <span>New notification from {sender}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-text-primary">User Alerts</h3>
          <p className="text-xs text-text-secondary">
            Keep track of who liked your posts, commented, replied, or followed you.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <Card className="p-0 border border-border overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border text-xs text-text-secondary">
              {notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-4 flex items-start space-x-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                    !notif.isRead ? 'bg-accent/[0.02]' : ''
                  }`}
                >
                  <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-border shrink-0">
                    {getNotifIcon(notif.type)}
                  </span>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {getNotifMessage(notif)}
                    </p>
                    <span className="text-[10px] text-text-secondary block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
              <CheckCircle className="h-8 w-8 text-text-secondary animate-pulse" />
              <h4 className="font-bold text-text-primary text-sm">You are all caught up!</h4>
              <p className="text-xs text-text-secondary max-w-sm">
                No new notifications received recently.
              </p>
            </div>
          )}
        </Card>
      )}

    </div>
  );
};
export default Notifications;
