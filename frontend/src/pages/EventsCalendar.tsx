import React, { useEffect, useState } from 'react';
import { Calendar, Search, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import api from '../services/api';
import type { Post } from '../types';
import PostCard from '../components/features/PostCard';
import Card from '../components/ui/Card';

export const EventsCalendar: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Local/community mock events list with high professional vibes
  const mockEvents = [
    {
      id: 'e1',
      title: 'Decentralized Data Summit 2026',
      description: 'Join developers, engineers, and researchers to discuss consensus, IPFS, Web3 storage layers, and cryptoeconomic blueprints.',
      type: 'conference',
      location: 'San Francisco, CA & Hybrid',
      date: 'July 28, 2026',
      link: 'https://datasummit.org'
    },
    {
      id: 'e2',
      title: 'Open-Source AI & LLM Hackathon',
      description: 'Collaborate with fellow engineers to build tools, plugins, and custom dataset fine-tunes utilizing fully open models.',
      type: 'hackathon',
      location: 'Virtual & Local Chapters',
      date: 'August 04, 2026',
      link: 'https://aihackathon.dev'
    },
    {
      id: 'e3',
      title: 'Deep Dive: Zero-Knowledge Proofs in Practice',
      description: 'A hands-on workshop explaining cryptographical primitives, zk-SNARKs mathematical formulas, and Circom circuit compilers.',
      type: 'workshop',
      location: 'Online Webinar',
      date: 'August 18, 2026',
      link: 'https://zkproofs.webinar'
    },
    {
      id: 'e4',
      title: 'Distributed Databases Meetup',
      description: 'Local meetup discussing database sharding parameters, CockroachDB architectures, and Cassandra cluster tuning operations.',
      type: 'meetup',
      location: 'Seattle Technical Center',
      date: 'September 02, 2026',
      link: 'https://meetup.com/dist-db'
    }
  ];

  const fetchEvents = async () => {
    try {
      // Query news or general community posts to look for announcements
      const res = await api.get('/posts?type=news&limit=20');
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching event announcements:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredMockEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? event.type === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Events Calendar</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Browse and coordinate participation in upcoming hackathons, local tech meetups, workshops, and international scientific conferences.
          </p>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search events by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-card text-text-primary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Event Types</option>
            <option value="conference">Conferences</option>
            <option value="hackathon">Hackathons</option>
            <option value="workshop">Workshops</option>
            <option value="meetup">Meetups</option>
            <option value="webinar">Webinars</option>
          </select>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Events List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Upcoming Schedule
          </h3>

          <div className="space-y-4">
            {filteredMockEvents.length > 0 ? (
              filteredMockEvents.map((event) => (
                <Card key={event.id} className="space-y-3 font-sans border-l-4 border-l-accent">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-accent/10 border border-accent/15 text-[9px] font-bold text-accent uppercase tracking-wider mb-1.5 capitalize">
                        {event.type}
                      </span>
                      <h4 className="text-sm font-bold text-text-primary leading-tight">
                        {event.title}
                      </h4>
                    </div>
                    
                    <span className="text-[10px] text-text-secondary bg-slate-100 dark:bg-slate-900 border border-border px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1.5 border-t border-border/60 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                      <span>{event.location}</span>
                    </div>

                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-semibold text-accent hover:underline ml-auto"
                    >
                      <span>Event Info</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <CalendarDays className="h-8 w-8 text-text-secondary mx-auto mb-2" />
                <p className="text-xs text-text-secondary font-medium">No matching events on this schedule</p>
              </Card>
            )}
          </div>

          {/* User Announcements from API */}
          {posts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-bold text-text-primary text-xs uppercase tracking-wider">
                Community Announcements
              </h3>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Sidebar Panel */}
        <div className="space-y-6">
          <Card className="space-y-3.5">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border pb-2.5">
              Host an Event
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you hosting a webinar, hackathon, or university study group? Share it as a "News/Announcement" post to get it listed on community feeds.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default EventsCalendar;
