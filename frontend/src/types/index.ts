export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  reputation: number;
  verificationBadge: 'none' | 'professor' | 'researcher' | 'developer' | 'club' | 'company' | 'organization';
  achievements: string[];
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  university?: string;
  profession?: string;
  skills: string[];
  interests: string[];
  fieldsFollowed?: string[];
  status: 'active' | 'suspended' | 'shadow_banned';
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  _id: string;
  name: string;
  slug: string;
  description: string;
  hierarchyPath?: string;
  moderators: string[];
  followersCount: number;
  postsCount: number;
}

export type PostType = 'insight' | 'research' | 'tutorial' | 'project' | 'question' | 'resource' | 'news';

export interface ResearchDetails {
  _id: string;
  abstract: string;
  summary: string;
  doi?: string;
  publication?: string;
  institution?: string;
  publicationDate?: string;
  authors: string[];
  pdfUrl?: string;
  githubRepo?: string;
  externalLinks: string[];
  isApproved: boolean;
}

export interface ProjectDetails {
  _id: string;
  architecture?: string;
  techStack: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isOpenSourceContribution: boolean;
  screenshots: string[];
  github?: string;
  demo?: string;
  installation?: string;
}

export interface ResourceDetails {
  _id: string;
  resourceType: 'book' | 'course' | 'documentation' | 'dataset' | 'cheatsheet' | 'interview_q' | 'github' | 'paper' | 'tool';
  url: string;
  rating: number;
  description?: string;
}

export interface Post {
  _id: string;
  type: PostType;
  title: string;
  slug: string;
  content: string;
  field: Field | string;
  tags: string[];
  author: User;
  readingTime: number;
  language: string;
  visibility?: 'public' | 'followers' | 'private';
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  featuredUntil?: string;
  upvotesCount: number;
  viewsCount: number;
  attachments: string[];
  images?: string[];
  sourceLinks: string[];
  researchDetails?: ResearchDetails;
  projectDetails?: ProjectDetails;
  resourceDetails?: ResourceDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment: string | null;
  upvotesCount: number;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkCollection {
  _id: string;
  user: string;
  name: string;
  parentCollection: BookmarkCollection | string | null;
  posts: Post[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'follow' | 'research_update';
  post?: { _id: string; title: string; slug: string };
  comment?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Event {
  _id: string;
  type: 'hackathon' | 'conference' | 'meetup' | 'workshop' | 'webinar';
  title: string;
  description: string;
  location: string;
  date: string;
  deadline?: string;
  organizer: User | string;
  link?: string;
}

export interface Job {
  _id: string;
  type: 'internship' | 'research_position' | 'open_source_program' | 'university_lab';
  title: string;
  company: string;
  description: string;
  location: string;
  stipend: string;
  link: string;
  tags: string[];
}

export interface Report {
  _id: string;
  reporter: User | { name: string; email: string };
  contentId: string;
  contentType: 'post' | 'comment' | 'user';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken: string;
  createdAt: string;
}
